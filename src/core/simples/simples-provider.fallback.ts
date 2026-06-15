import type {
  SimplesLookupOptions,
  SimplesLookupPort,
} from "./simples-lookup.port";
import type { SimplesLookupResult } from "./simples-lookup.types";
import {
  getAutomaticFallbackProviderNames,
  getSimplesProviderDefinition,
  getSimplesProviderNames,
} from "./simples-provider.catalog";
import {
  SimplesProviderHealthRegistry,
  shouldFallbackAfterResult,
} from "./simples-provider.health";
import type { SimplesProviderName } from "./simples-provider.names";

export type SimplesProviderFactory = (
  providerName: SimplesProviderName,
) => SimplesLookupPort;

export type SimplesFallbackLookupOptions = {
  fallbackProviderNames?: readonly SimplesProviderName[];
  healthRegistry?: SimplesProviderHealthRegistry;
};

export class SimplesFallbackLookupAdapter implements SimplesLookupPort {
  private readonly healthRegistry: SimplesProviderHealthRegistry;
  private readonly providerByName = new Map<
    SimplesProviderName,
    SimplesLookupPort
  >();
  private readonly fallbackProviderNames: readonly SimplesProviderName[];

  constructor(
    private readonly primaryProviderName: SimplesProviderName,
    private readonly createProvider: SimplesProviderFactory,
    options: SimplesFallbackLookupOptions = {},
  ) {
    const primaryDefinition = getSimplesProviderDefinition(primaryProviderName);
    this.fallbackProviderNames =
      options.fallbackProviderNames ??
      (primaryDefinition.capabilities.automaticFallback
        ? getAutomaticFallbackProviderNames(primaryProviderName)
        : []);
    this.healthRegistry =
      options.healthRegistry ??
      new SimplesProviderHealthRegistry(getSimplesProviderNames());
  }

  async lookup(
    cnpj: string,
    options: SimplesLookupOptions = {},
  ): Promise<SimplesLookupResult> {
    let lastResult: SimplesLookupResult | null = null;

    for (const providerName of this.getAttemptOrder()) {
      if (!this.healthRegistry.canAttempt(providerName)) {
        continue;
      }

      const result = await this.lookupWithBudget(providerName, cnpj, options);
      this.healthRegistry.recordResult(providerName, result);
      lastResult = result;

      if (!shouldFallbackAfterResult(result)) {
        return result;
      }
    }

    return (
      lastResult ?? {
        cnpj,
        simplesNacional: null,
        simei: null,
        source: this.primaryProviderName,
        status: "TEMPORARY_ERROR",
        message: "Nenhum provider automatico disponivel para consulta.",
      }
    );
  }

  private async lookupWithBudget(
    providerName: SimplesProviderName,
    cnpj: string,
    options: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    const definition = getSimplesProviderDefinition(providerName);
    let lastResult: SimplesLookupResult | null = null;

    for (
      let attempt = 0;
      attempt < definition.retry.maxAttempts;
      attempt += 1
    ) {
      try {
        const result = await this.getProvider(providerName).lookup(
          cnpj,
          options,
        );
        lastResult = result;

        if (!shouldFallbackAfterResult(result)) {
          return result;
        }
      } catch {
        lastResult = {
          cnpj,
          simplesNacional: null,
          simei: null,
          source: providerName,
          status: "TEMPORARY_ERROR",
          message: "Falha temporaria do provider.",
        };
      }
    }

    return (
      lastResult ?? {
        cnpj,
        simplesNacional: null,
        simei: null,
        source: providerName,
        status: "TEMPORARY_ERROR",
        message: "Budget de retry esgotado sem resultado.",
      }
    );
  }

  private getAttemptOrder(): readonly SimplesProviderName[] {
    const primaryDefinition = getSimplesProviderDefinition(
      this.primaryProviderName,
    );
    const primaryProviders =
      primaryDefinition.mode === "assisted" ? [] : [this.primaryProviderName];

    return [...primaryProviders, ...this.fallbackProviderNames].filter(
      (providerName, index, providers) => {
        if (providers.indexOf(providerName) !== index) {
          return false;
        }

        if (providerName === this.primaryProviderName) {
          return true;
        }

        return getSimplesProviderDefinition(providerName).capabilities
          .automaticFallback;
      },
    );
  }

  private getProvider(providerName: SimplesProviderName): SimplesLookupPort {
    const cachedProvider = this.providerByName.get(providerName);
    if (cachedProvider) {
      return cachedProvider;
    }

    const provider = this.createProvider(providerName);
    this.providerByName.set(providerName, provider);
    return provider;
  }
}

import { CnpjaOpenSimplesLookupAdapter } from "./adapters/cnpja-open-simples-lookup.adapter";
import { LocalPublicBaseSimplesLookupAdapter } from "./adapters/local-public-base-simples-lookup.adapter";
import { MockSimplesLookupAdapter } from "./adapters/mock-simples-lookup.adapter";
import { ReceitaConsultaOptantesAdapter } from "./adapters/receita-web/receita-consulta-optantes.adapter";
import type { SimplesLookupPort } from "./simples-lookup.port";
import {
  SimplesFallbackLookupAdapter,
  type SimplesFallbackLookupOptions,
} from "./simples-provider.fallback";
import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "./simples-provider.names";

export { SIMPLES_PROVIDER, type SimplesProviderName };

export function createSimplesLookupProvider(
  providerName: SimplesProviderName,
): SimplesLookupPort {
  if (providerName === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return new CnpjaOpenSimplesLookupAdapter();
  }

  if (providerName === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return new LocalPublicBaseSimplesLookupAdapter();
  }

  if (
    providerName === SIMPLES_PROVIDER.RECEITA_WEB ||
    providerName === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
  ) {
    return new ReceitaConsultaOptantesAdapter();
  }

  return new MockSimplesLookupAdapter();
}

export function createFallbackSimplesLookupProvider(
  providerName: SimplesProviderName,
  options: SimplesFallbackLookupOptions = {},
): SimplesLookupPort {
  return new SimplesFallbackLookupAdapter(
    providerName,
    createSingleAttemptSimplesLookupProvider,
    options,
  );
}

function createSingleAttemptSimplesLookupProvider(
  providerName: SimplesProviderName,
): SimplesLookupPort {
  if (providerName === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return new CnpjaOpenSimplesLookupAdapter(undefined, undefined, 1);
  }

  return createSimplesLookupProvider(providerName);
}

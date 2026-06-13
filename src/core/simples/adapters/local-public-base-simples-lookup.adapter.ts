import { normalizeCnpj } from "../../cnpj/normalize-cnpj";
import { validateCnpj } from "../../cnpj/validate-cnpj";
import { LOCAL_PUBLIC_BASE_SOURCE } from "../../public-base/local-public-base.fixture";
import {
  createLocalPublicBaseIndex,
  getLocalPublicBaseStatus,
  type LocalPublicBaseIndex,
} from "../../public-base/local-public-base.index";
import type { LocalPublicBaseStatus } from "../../public-base/local-public-base.types";
import type { SimplesLookupPort } from "../simples-lookup.port";
import type { SimplesLookupResult } from "../simples-lookup.types";

export class LocalPublicBaseSimplesLookupAdapter implements SimplesLookupPort {
  constructor(
    private readonly index: LocalPublicBaseIndex = createLocalPublicBaseIndex(),
    private readonly status: LocalPublicBaseStatus = getLocalPublicBaseStatus(),
  ) {}

  async lookup(cnpj: string): Promise<SimplesLookupResult> {
    const normalizedCnpj = normalizeCnpj(cnpj);
    const baseDate = this.status.baseDate ?? "data não informada";

    if (!validateCnpj(normalizedCnpj)) {
      return {
        cnpj: normalizedCnpj,
        simplesNacional: null,
        simei: null,
        source: LOCAL_PUBLIC_BASE_SOURCE,
        status: "INVALID_CNPJ",
        message: "CNPJ inválido para consulta na Base Pública Local.",
        raw: {
          baseDate,
        },
      };
    }

    const record = this.index.findByCnpj(normalizedCnpj);

    if (!record) {
      return {
        cnpj: normalizedCnpj,
        simplesNacional: null,
        simei: null,
        source: LOCAL_PUBLIC_BASE_SOURCE,
        status: "NOT_FOUND",
        message: `CNPJ não encontrado na Base Pública Local de ${baseDate}.`,
        raw: {
          baseDate,
        },
      };
    }

    return {
      cnpj: normalizedCnpj,
      simplesNacional: record.simplesNacional,
      simei: record.simei,
      source: LOCAL_PUBLIC_BASE_SOURCE,
      status: "SUCCESS",
      message: `Base Pública Local ${baseDate}: ${record.razaoSocial}.`,
      raw: {
        baseDate,
        razaoSocial: record.razaoSocial,
        updatedAt: record.updatedAt,
      },
    };
  }
}

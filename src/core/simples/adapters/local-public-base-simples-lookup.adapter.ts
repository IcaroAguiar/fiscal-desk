import { LOCAL_PUBLIC_BASE_SOURCE } from "../../public-base/local-public-base.fixture";
import {
  createLocalPublicBaseIndex,
  getLocalPublicBaseStatus,
  type LocalPublicBaseIndex,
} from "../../public-base/local-public-base.index";
import type { SimplesLookupPort } from "../simples-lookup.port";
import type { SimplesLookupResult } from "../simples-lookup.types";

export class LocalPublicBaseSimplesLookupAdapter implements SimplesLookupPort {
  constructor(
    private readonly index: LocalPublicBaseIndex = createLocalPublicBaseIndex(),
  ) {}

  async lookup(cnpj: string): Promise<SimplesLookupResult> {
    const record = this.index.findByCnpj(cnpj);
    const status = getLocalPublicBaseStatus();

    if (!record) {
      return {
        cnpj,
        simplesNacional: null,
        simei: null,
        source: LOCAL_PUBLIC_BASE_SOURCE,
        status: "NOT_FOUND",
        message: `CNPJ não encontrado na Base Pública Local de ${status.baseDate}.`,
        raw: {
          baseDate: status.baseDate,
        },
      };
    }

    return {
      cnpj,
      simplesNacional: record.simplesNacional,
      simei: record.simei,
      source: LOCAL_PUBLIC_BASE_SOURCE,
      status: "SUCCESS",
      message: `Base Pública Local ${status.baseDate}: ${record.razaoSocial}.`,
      raw: {
        baseDate: status.baseDate,
        razaoSocial: record.razaoSocial,
        updatedAt: record.updatedAt,
      },
    };
  }
}

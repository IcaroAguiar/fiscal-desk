import {
  LOCAL_PUBLIC_BASE_RECORDS,
  LOCAL_PUBLIC_BASE_STATUS,
} from "./local-public-base.fixture";
import type {
  LocalPublicBaseRecord,
  LocalPublicBaseStatus,
} from "./local-public-base.types";

export class LocalPublicBaseIndex {
  private readonly recordsByCnpj: ReadonlyMap<string, LocalPublicBaseRecord>;

  constructor(records: readonly LocalPublicBaseRecord[]) {
    this.recordsByCnpj = new Map(
      records.map((record) => [record.cnpj, record]),
    );
  }

  findByCnpj(cnpj: string): LocalPublicBaseRecord | null {
    return this.recordsByCnpj.get(cnpj) ?? null;
  }
}

export function createLocalPublicBaseIndex(): LocalPublicBaseIndex {
  return new LocalPublicBaseIndex(LOCAL_PUBLIC_BASE_RECORDS);
}

export function getLocalPublicBaseStatus(): LocalPublicBaseStatus {
  return LOCAL_PUBLIC_BASE_STATUS;
}

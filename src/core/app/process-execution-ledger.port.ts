import type { SimplesLookupResult } from "../simples/simples-lookup.types";

export type ProcessExecutionLedgerSession = {
  readonly runId: string;
  readonly checkpointPath: string | null;
  setTotalUniqueLookups(totalUniqueLookups: number): Promise<void>;
  restoreLookup(cnpj: string): Promise<SimplesLookupResult | null>;
  saveLookup(result: SimplesLookupResult): Promise<void>;
};

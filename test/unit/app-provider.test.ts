import { describe, expect, it } from "vitest";

import type { ProcessExecutionHistoryItem } from "../../src/main/types";
import { initialState } from "../../src/renderer/ui/app.types";
import { prepareLocalPublicBaseResume } from "../../src/renderer/ui/app-provider";

const baseHistoryItem: ProcessExecutionHistoryItem = {
  canResume: true,
  checkpointPath: "/tmp/ledger.json",
  checkpointedUniqueLookups: 1,
  cnpjColumn: "cnpj",
  completedAt: null,
  ledgerKey: "base-publica-local-0123456789abcdef01234567.json",
  outputPath: null,
  providerConfigVersion: "provider-config-v1",
  providerName: "base-publica-local",
  resumeBlockedReason: null,
  runId: "run-1",
  sourceFileName: "entrada.csv",
  sourceFilePath: "/tmp/entrada.csv",
  startedAt: "2026-05-20T10:00:00.000Z",
  status: "CANCELLED",
  summary: null,
  totalUniqueLookups: 3,
  updatedAt: "2026-05-20T10:01:00.000Z",
};

describe("app provider helpers", () => {
  it("selects Base Pública Local and asks for Data da Base consent before resuming from another provider", () => {
    const state = {
      ...initialState,
      provider: "mock" as const,
      localPublicBaseNoticeAccepted: false,
    };

    const canResume = prepareLocalPublicBaseResume(state, baseHistoryItem);

    expect(canResume).toBe(false);
    expect(state.provider).toBe("base-publica-local");
    expect(state.localPublicBaseNoticeAccepted).toBe(false);
    expect(state.message).toContain("Confirme o aviso de Data da Base");
  });

  it("allows Base Pública Local resume after consent is visible and accepted", () => {
    const state = {
      ...initialState,
      provider: "base-publica-local" as const,
      localPublicBaseNoticeAccepted: true,
    };

    expect(prepareLocalPublicBaseResume(state, baseHistoryItem)).toBe(true);
  });

  it("does not require Data da Base consent for other providers", () => {
    const state = { ...initialState };
    const historyItem = {
      ...baseHistoryItem,
      ledgerKey: "mock-0123456789abcdef01234567.json",
      providerName: "mock" as const,
    };

    expect(prepareLocalPublicBaseResume(state, historyItem)).toBe(true);
    expect(state.provider).toBe("base-publica-local");
  });
});

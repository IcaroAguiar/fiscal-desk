import { describe, expect, it } from "vitest";

import { initialState } from "../../src/renderer/ui/app.types";
import { shouldDisableLocalPublicBasePrepareButton } from "../../src/renderer/ui/app-sync-rules";

describe("app sync", () => {
  it("keeps Base Pública Local preparation disabled until notice acceptance survives sync", () => {
    expect(
      shouldDisableLocalPublicBasePrepareButton({
        ...initialState,
        provider: "base-publica-local",
      }),
    ).toBe(true);

    expect(
      shouldDisableLocalPublicBasePrepareButton({
        ...initialState,
        localPublicBaseNoticeAccepted: true,
        provider: "base-publica-local",
      }),
    ).toBe(false);
  });
});

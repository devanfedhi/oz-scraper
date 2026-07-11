import { describe, expect, it, vi } from "vitest";

import { runDealParser } from "./run-deal-parser.js";

describe("runDealParser", () => {
  it("returns the deal parser result with the input externalId", async () => {
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      }
    };

    await expect(runDealParser(ctx as never, { externalId: "967471" })).resolves.toEqual({
      service: "deal-parser",
      status: "ok",
      externalId: "967471",
      executedAt: "2026-07-01T00:00:00.000Z"
    });
  });
});

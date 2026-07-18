import { describe, expect, it, vi } from "vitest";

import { fetchOzBargainDealByIdStepRetryPolicy } from "../steps/fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.policy.js";
import { runDealParser } from "./run-deal-parser.js";

describe("runDealParser", () => {
  it("fetches the deal page by externalId and returns the deal parser result", async () => {
    const run = vi.fn().mockResolvedValue({
      externalId: "967471",
      scrapedData: {
        actualDealUrl: null,
        clickCount: null,
        couponCode: null,
        descriptionText: null,
        endDateText: null,
        isAffiliate: false,
        isFreebie: false,
        labels: [],
        merchantDomainText: null,
        ozbargainGotoUrl: null,
        relatedStores: [],
        startDateText: null,
        voteCountNegative: null,
        voteCountPositive: null
      },
      sourceUrl: "https://www.ozbargain.com.au/node/967471",
      structuredData: null
    });
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      run
    };

    await expect(runDealParser(ctx as never, { externalId: "967471" })).resolves.toEqual({
      service: "deal-parser",
      status: "ok",
      externalId: "967471",
      sourceUrl: "https://www.ozbargain.com.au/node/967471",
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(run).toHaveBeenCalledWith(
      "fetch-ozbargain-deal-by-id",
      expect.any(Function),
      fetchOzBargainDealByIdStepRetryPolicy
    );
    expect(consoleLogSpy).toHaveBeenCalledOnce();
    expect(consoleLogSpy.mock.calls[0]?.[0]).toContain(
      "sourceUrl: 'https://www.ozbargain.com.au/node/967471'"
    );
    consoleLogSpy.mockRestore();
  });

  it("logs and rethrows when the fetch step fails", async () => {
    const error = new Error("fetch deal failed");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      run: vi.fn().mockRejectedValue(error)
    };

    await expect(runDealParser(ctx as never, { externalId: "967471" })).rejects.toThrow(error);
    expect(ctx.run).toHaveBeenCalledWith(
      "fetch-ozbargain-deal-by-id",
      expect.any(Function),
      fetchOzBargainDealByIdStepRetryPolicy
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Parser run for deal with ID ["967471"] failed',
      error
    );
    consoleErrorSpy.mockRestore();
  });
});

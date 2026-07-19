import { describe, expect, it, vi } from "vitest";

import { fetchOzBargainDealByIdStepRetryPolicy } from "../steps/fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.policy.js";
import { runDealParser } from "./run-deal-parser.js";

describe("runDealParser", () => {
  it("fetches the deal page by externalId and returns the deal parser result", async () => {
    const fetchedDeal = {
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
    };
    const parsedDeal = {
      actualDealUrl: null,
      authorExternalId: null,
      clickCount: null,
      commentCount: null,
      couponCode: null,
      description: null,
      endDate: null,
      externalId: "967471",
      id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      imageUrl: null,
      isAffiliate: false,
      isFreebie: false,
      label: null,
      merchantDomainText: null,
      modifiedAt: null,
      ozbargainGotoUrl: null,
      publishedAt: null,
      scrapedAt: new Date("2026-07-01T00:00:00.000Z"),
      sourceUrl: "https://www.ozbargain.com.au/node/967471",
      startDate: null,
      title: "https://www.ozbargain.com.au/node/967471",
      voteCountNegative: null,
      voteCountPositive: null,
      relatedStores: [],
      tags: []
    };
    const run = vi.fn().mockResolvedValueOnce(fetchedDeal).mockResolvedValueOnce(parsedDeal);
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
    expect(run).toHaveBeenNthCalledWith(2, "parse-deal-data-to-entity", expect.any(Function));
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy.mock.calls.at(-1)?.[0]).toContain(
      "https://www.ozbargain.com.au/node/967471"
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

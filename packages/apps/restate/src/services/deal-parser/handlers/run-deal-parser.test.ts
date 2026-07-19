import { describe, expect, it, vi } from "vitest";

import { fetchOzBargainDealByIdStepRetryPolicy } from "../steps/fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.policy.js";
import { runDealParser } from "./run-deal-parser.js";

describe("runDealParser", () => {
  it("fetches the deal page by externalId and returns the deal parser result", async () => {
    const fetchedDeal = {
      externalId: "967471",
      scrapedData: {
        actualDealUrl: "https://example.com/deal",
        clickCount: 75,
        couponCode: null,
        descriptionText: "Body copy",
        endDateText: null,
        isAffiliate: false,
        isFreebie: false,
        labels: ["targeted"],
        merchantDomainText: "merchant.example",
        ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/967471",
        relatedStores: [
          {
            dealProfileUrl: "https://www.ozbargain.com.au/deals/example.com",
            marker: null,
            name: "Example Store"
          }
        ],
        startDateText: null,
        voteCountNegative: 0,
        voteCountPositive: 5
      },
      sourceUrl: "https://www.ozbargain.com.au/node/967471",
      structuredData: {
        author: {
          name: "Example Author",
          url: "https://www.ozbargain.com.au/user/123"
        },
        commentCount: 12,
        dateModified: "2026-07-01T11:00:00+1000",
        datePublished: "2026-07-01T10:40:05+1000",
        headline: "Example deal",
        image: "https://files.ozbargain.com.au/n/71/967471l.jpg?h=abc123",
        keywords: ["Electrical & Electronics"]
      }
    };
    const run = vi.fn().mockResolvedValueOnce(fetchedDeal);
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      rand: {
        uuidv4: vi.fn().mockReturnValue("35a6d3cb-875d-4a24-8f95-7319bf3afc34")
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
    expect(run).toHaveBeenCalledTimes(1);
    expect(ctx.date.now).toHaveBeenCalledTimes(2);
    expect(ctx.rand.uuidv4).toHaveBeenCalledOnce();
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

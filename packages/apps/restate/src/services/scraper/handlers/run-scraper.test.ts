import { describe, expect, it, vi } from "vitest";

import { runScraper } from "./run-scraper.js";

describe("runScraper", () => {
  it("fetches the deal ids, enqueues parsing, and returns the scraper result", async () => {
    const run = vi.fn();
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      serviceSendClient: vi.fn().mockReturnValue({
        run
      }),
      run: vi.fn().mockResolvedValue({
        externalIds: ["967471", "967469"]
      })
    };

    await expect(runScraper(ctx as never)).resolves.toEqual({
      service: "scraper",
      status: "ok",
      sourceUrl:
        "https://www.ozbargain.com.au/api/live?last=0&disable=comments,votes,wiki&types=Comp,Forum",
      fetchedCount: 2,
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(ctx.run).toHaveBeenCalledOnce();
    expect(ctx.serviceSendClient).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenNthCalledWith(
      1,
      { externalId: "967471" },
      expect.objectContaining({
        getOpts: expect.any(Function)
      })
    );
    expect(run).toHaveBeenNthCalledWith(
      2,
      { externalId: "967469" },
      expect.objectContaining({
        getOpts: expect.any(Function)
      })
    );
    expect(run.mock.calls[0]?.[1]?.getOpts()).toEqual({
      idempotencyKey: "deal-parser//967471//2026-07-01T00:00:00.000Z"
    });
    expect(run.mock.calls[1]?.[1]?.getOpts()).toEqual({
      idempotencyKey: "deal-parser//967469//2026-07-01T00:00:00.000Z"
    });
  });

  it("returns a failed result when fetching deal ids fails", async () => {
    const run = vi.fn();
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      serviceSendClient: vi.fn().mockReturnValue({
        run
      }),
      run: vi.fn().mockRejectedValue(new Error("fetch failed"))
    };

    await expect(runScraper(ctx as never)).resolves.toEqual({
      service: "scraper",
      status: "failed",
      sourceUrl:
        "https://www.ozbargain.com.au/api/live?last=0&disable=comments,votes,wiki&types=Comp,Forum",
      fetchedCount: 0,
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(ctx.run).toHaveBeenCalledOnce();
    expect(ctx.serviceSendClient).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it("returns a failed result when enqueuing deal parsing fails", async () => {
    const run = vi.fn().mockImplementation(() => {
      throw new Error("send failed");
    });
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      serviceSendClient: vi.fn().mockReturnValue({
        run
      }),
      run: vi.fn().mockResolvedValue({
        externalIds: ["967471", "967469"]
      })
    };

    await expect(runScraper(ctx as never)).resolves.toEqual({
      service: "scraper",
      status: "failed",
      sourceUrl:
        "https://www.ozbargain.com.au/api/live?last=0&disable=comments,votes,wiki&types=Comp,Forum",
      fetchedCount: 0,
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(ctx.run).toHaveBeenCalledOnce();
    expect(ctx.serviceSendClient).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(
      { externalId: "967471" },
      expect.objectContaining({
        getOpts: expect.any(Function)
      })
    );
    expect(run.mock.calls[0]?.[1]?.getOpts()).toEqual({
      idempotencyKey: "deal-parser//967471//2026-07-01T00:00:00.000Z"
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import { runScraper } from "./run-scraper.js";

describe("runScraper", () => {
  it("runs the database healthcheck step and returns the scraper result", async () => {
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      run: vi.fn().mockResolvedValue({
        status: "ok",
        database: "oz_scraper"
      })
    };

    await expect(runScraper(ctx as never)).resolves.toEqual({
      service: "scraper",
      status: "ok",
      runtime: "node",
      database: "oz_scraper",
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(ctx.run).toHaveBeenCalledOnce();
  });
});

import { describe, expect, it, vi } from "vitest";

import { runNotifier } from "./run-notifier.js";

describe("runNotifier", () => {
  it("runs the database healthcheck step and returns the notifier result", async () => {
    const ctx = {
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      run: vi.fn().mockResolvedValue({
        status: "ok",
        database: "oz_scraper"
      })
    };

    await expect(runNotifier(ctx as never)).resolves.toEqual({
      service: "notifier",
      status: "ok",
      database: "oz_scraper",
      executedAt: "2026-07-01T00:00:00.000Z"
    });
    expect(ctx.run).toHaveBeenCalledOnce();
  });
});

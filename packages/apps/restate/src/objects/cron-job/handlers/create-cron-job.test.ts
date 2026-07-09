import * as restate from "@restatedev/restate-sdk";
import { describe, expect, it, vi } from "vitest";

import { CRON_JOB_STATE, createCronJob, scheduleNextCronJobExecution } from "./create-cron-job.js";

describe("createCronJob", () => {
  it("throws when the preset is unknown", async () => {
    const ctx = {
      key: "unknown",
      get: vi.fn(),
      date: { now: vi.fn() },
      genericSend: vi.fn(),
      set: vi.fn()
    };

    await expect(createCronJob(ctx as never)).rejects.toThrow(restate.TerminalError);
  });

  it("throws when the cron job already exists", async () => {
    const ctx = {
      key: "scraper",
      get: vi.fn().mockResolvedValue({ existing: true }),
      date: { now: vi.fn() },
      genericSend: vi.fn(),
      set: vi.fn()
    };

    await expect(createCronJob(ctx as never)).rejects.toThrow("Cron job already exists");
  });
});

describe("scheduleNextCronJobExecution", () => {
  it("schedules the next execution and stores the state", async () => {
    const currentDate = Date.parse("2026-07-01T00:00:00.000Z");
    const ctx = {
      key: "scraper",
      date: {
        now: vi.fn().mockResolvedValue(currentDate)
      },
      genericSend: vi.fn(() => ({
        invocationId: Promise.resolve("invocation-123")
      })),
      set: vi.fn()
    };

    const result = await scheduleNextCronJobExecution(ctx as never, {
      cronExpression: "*/10 * * * *",
      service: "ScraperService",
      method: "run"
    });

    expect(ctx.genericSend).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "CronJob",
        method: "execute",
        key: "scraper",
        delay: { milliseconds: 600000 }
      })
    );
    expect(ctx.set).toHaveBeenCalledWith(CRON_JOB_STATE, result);
    expect(result).toEqual({
      request: {
        cronExpression: "*/10 * * * *",
        service: "ScraperService",
        method: "run"
      },
      nextExecutionTime: "2026-07-01T00:10:00.000Z",
      nextExecutionId: "invocation-123"
    });
  });

  it("throws for invalid cron expressions", async () => {
    const ctx = {
      key: "scraper",
      date: {
        now: vi.fn().mockResolvedValue(Date.parse("2026-07-01T00:00:00.000Z"))
      },
      genericSend: vi.fn(),
      set: vi.fn()
    };

    await expect(
      scheduleNextCronJobExecution(ctx as never, {
        cronExpression: "bad cron",
        service: "ScraperService",
        method: "run"
      })
    ).rejects.toThrow("Invalid cron expression");
  });
});

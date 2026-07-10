import * as restate from "@restatedev/restate-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

const scheduleNextCronJobExecutionMock = vi.fn();

vi.mock("./create-cron-job.js", async () => {
  const actual = await vi.importActual("./create-cron-job.js");

  return {
    ...actual,
    scheduleNextCronJobExecution: scheduleNextCronJobExecutionMock
  };
});

describe("executeCronJob", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    scheduleNextCronJobExecutionMock.mockResolvedValue({
      nextExecutionId: "next-id",
      nextExecutionTime: "2026-07-01T00:10:00.000Z",
      request: {
        cronExpression: "*/10 * * * *",
        service: "ScraperService",
        method: "run"
      }
    });
  });

  it("throws when the job state is missing", async () => {
    const { executeCronJob } = await import("./execute-cron-job.js");
    const ctx = {
      get: vi.fn().mockResolvedValue(null),
      genericSend: vi.fn()
    };

    await expect(executeCronJob(ctx as never)).rejects.toThrow(restate.TerminalError);
  });

  it("sends an empty payload when none is provided", async () => {
    const { executeCronJob } = await import("./execute-cron-job.js");
    const request = {
      cronExpression: "*/10 * * * *",
      service: "ScraperService",
      method: "run"
    };
    const ctx = {
      get: vi.fn().mockResolvedValue({ request }),
      genericSend: vi.fn()
    };

    const result = await executeCronJob(ctx as never);

    expect(ctx.genericSend).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "ScraperService",
        method: "run",
        parameter: undefined,
        inputSerde: restate.serde.empty
      })
    );
    expect(scheduleNextCronJobExecutionMock).toHaveBeenCalledWith(ctx, request);
    expect(result).toEqual({
      nextExecutionId: "next-id",
      nextExecutionTime: "2026-07-01T00:10:00.000Z",
      request: {
        cronExpression: "*/10 * * * *",
        service: "ScraperService",
        method: "run"
      }
    });
  });

  it("sends a JSON payload when one is provided", async () => {
    const { executeCronJob } = await import("./execute-cron-job.js");
    const request = {
      cronExpression: "*/5 * * * *",
      service: "NotifierService",
      method: "run",
      payload: { hello: "world" }
    };
    const ctx = {
      get: vi.fn().mockResolvedValue({ request }),
      genericSend: vi.fn()
    };

    await executeCronJob(ctx as never);

    expect(ctx.genericSend).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "NotifierService",
        method: "run",
        parameter: { hello: "world" },
        inputSerde: restate.serde.json
      })
    );
  });
});

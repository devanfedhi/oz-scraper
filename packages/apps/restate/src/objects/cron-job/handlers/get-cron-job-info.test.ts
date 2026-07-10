import { describe, expect, it, vi } from "vitest";

import { getCronJobInfo } from "./get-cron-job-info.js";

describe("getCronJobInfo", () => {
  it("returns null when there is no job state", async () => {
    const ctx = {
      get: vi.fn().mockResolvedValue(undefined)
    };

    await expect(getCronJobInfo(ctx as never)).resolves.toBeNull();
  });

  it("returns the stored cron job state", async () => {
    const state = {
      request: {
        cronExpression: "*/10 * * * *",
        service: "ScraperService",
        method: "run"
      },
      nextExecutionTime: "2026-07-01T00:10:00.000Z",
      nextExecutionId: "invocation-123"
    };
    const ctx = {
      get: vi.fn().mockResolvedValue(state)
    };

    await expect(getCronJobInfo(ctx as never)).resolves.toEqual(state);
  });
});

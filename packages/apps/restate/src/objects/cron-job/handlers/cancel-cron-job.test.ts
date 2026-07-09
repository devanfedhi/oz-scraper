import * as restate from "@restatedev/restate-sdk";
import { describe, expect, it, vi } from "vitest";

import { cancelCronJob } from "./cancel-cron-job.js";

describe("cancelCronJob", () => {
  it("throws when the job state is missing", async () => {
    const ctx = {
      get: vi.fn().mockResolvedValue(null),
      cancel: vi.fn(),
      clearAll: vi.fn()
    };

    await expect(cancelCronJob(ctx as never)).rejects.toThrow(restate.TerminalError);
  });

  it("cancels the next execution and clears state", async () => {
    const ctx = {
      get: vi.fn().mockResolvedValue({ nextExecutionId: "invocation-123" }),
      cancel: vi.fn(),
      clearAll: vi.fn()
    };

    await cancelCronJob(ctx as never);

    expect(ctx.cancel).toHaveBeenCalledWith("invocation-123");
    expect(ctx.clearAll).toHaveBeenCalledOnce();
  });
});

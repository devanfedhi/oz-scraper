import * as restate from "@restatedev/restate-sdk";

import type { CronJobInfo } from "../cron-job.types.js";
import { CRON_JOB_STATE } from "./initiate-cron-job.js";

export async function cancelCronJob(ctx: restate.ObjectContext): Promise<void> {
  const cronJobState = await ctx.get<CronJobInfo>(CRON_JOB_STATE);
  if (!cronJobState) {
    throw new restate.TerminalError("Job not found.");
  }

  ctx.cancel(cronJobState.nextExecutionId as Parameters<typeof ctx.cancel>[0]);
  ctx.clearAll();
}

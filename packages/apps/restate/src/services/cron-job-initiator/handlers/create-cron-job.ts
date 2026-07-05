import * as restate from "@restatedev/restate-sdk";

import { cronJob } from "../../../objects/cron-job/cron-job.js";
import type { CronJobInfo, CronJobRequest } from "../../../objects/cron-job/cron-job.types.js";
import type { CronJobCreateResult } from "../cron-job-initiator.types.js";

export async function createCronJob(
  ctx: restate.Context,
  request: CronJobRequest
): Promise<CronJobCreateResult> {
  const jobId = ctx.rand.uuidv4();
  const job = (await ctx.objectClient(cronJob, jobId).initiate(request)) as CronJobInfo;

  return {
    jobId,
    nextExecutionTime: job.nextExecutionTime
  };
}

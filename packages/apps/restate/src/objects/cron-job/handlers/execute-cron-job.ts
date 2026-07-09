import * as restate from "@restatedev/restate-sdk";

import type { CronJobInfo } from "../cron-job.types.js";
import { CRON_JOB_STATE, scheduleNextCronJobExecution } from "./create-cron-job.js";

export async function executeCronJob(ctx: restate.ObjectContext): Promise<CronJobInfo> {
  const cronJobState = await ctx.get<CronJobInfo>(CRON_JOB_STATE);
  if (!cronJobState) {
    throw new restate.TerminalError("Job not found.");
  }

  const { service, method, key, payload } = cronJobState.request;
  if (payload === undefined) {
    ctx.genericSend({
      service,
      method,
      key,
      parameter: undefined,
      inputSerde: restate.serde.empty
    });
  } else {
    ctx.genericSend({
      service,
      method,
      key,
      parameter: payload,
      inputSerde: restate.serde.json
    });
  }

  return scheduleNextCronJobExecution(ctx, cronJobState.request);
}

import * as restate from "@restatedev/restate-sdk";

import type { CronJobInfo } from "../cron-job.types.js";
import { CRON_JOB_STATE } from "./initiate-cron-job.js";

export async function getCronJobInfo(ctx: restate.ObjectSharedContext): Promise<CronJobInfo | null> {
  return (await ctx.get<CronJobInfo>(CRON_JOB_STATE)) ?? null;
}

import { CronExpressionParser } from "cron-parser";

import * as restate from "@restatedev/restate-sdk";

import type { CronJobInfo, CronJobRequest } from "../cron-job.types.js";
import { CRON_JOB_PRESETS } from "../cron-job.config.js";

export const CRON_JOB_STATE = "job-state";

export async function createCronJob(ctx: restate.ObjectContext): Promise<CronJobInfo> {
  const request = getCronJobRequestOrThrow(ctx.key);

  if (await ctx.get<CronJobInfo>(CRON_JOB_STATE)) {
    throw new restate.TerminalError("Cron job already exists for this preset.");
  }

  return scheduleNextCronJobExecution(ctx, request);
}

export async function scheduleNextCronJobExecution(
  ctx: restate.ObjectContext,
  request: CronJobRequest
): Promise<CronJobInfo> {
  const currentDate = await ctx.date.now();

  let interval;
  try {
    interval = CronExpressionParser.parse(request.cronExpression, { currentDate });
  } catch (error) {
    throw new restate.TerminalError(`Invalid cron expression: ${(error as Error).message}`);
  }

  const next = interval.next().toDate();
  const delay = next.getTime() - currentDate;
  const handle = ctx.genericSend({
    service: "CronJob",
    method: "execute",
    key: ctx.key,
    parameter: undefined,
    inputSerde: restate.serde.empty,
    delay: { milliseconds: delay }
  });

  const cronJobState: CronJobInfo = {
    request,
    nextExecutionTime: next.toISOString(),
    nextExecutionId: (await handle.invocationId) as string
  };

  ctx.set(CRON_JOB_STATE, cronJobState);
  return cronJobState;
}

function getCronJobRequestOrThrow(jobKey: string): CronJobRequest {
  const cronJobPreset = CRON_JOB_PRESETS[jobKey as keyof typeof CRON_JOB_PRESETS];
  if (!cronJobPreset) {
    throw new restate.TerminalError("Unknown cron job preset.");
  }

  return {
    cronExpression: cronJobPreset.cronExpression,
    service: cronJobPreset.service,
    method: cronJobPreset.method
  };
}

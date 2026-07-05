import * as restate from "@restatedev/restate-sdk";

import { databaseHealthcheckStepRetryPolicy } from "../../shared/steps/database-healthcheck/database-healthcheck.policy.js";
import { runDatabaseHealthcheckStep } from "../../shared/steps/database-healthcheck/database-healthcheck.js";
import type { NotifierRunResult } from "../notifier.types.js";

export async function runNotifier(ctx: restate.Context): Promise<NotifierRunResult> {
  const executedAt = new Date(await ctx.date.now()).toISOString();
  const result = await ctx.run(
    "database-healthcheck",
    runDatabaseHealthcheckStep,
    databaseHealthcheckStepRetryPolicy
  );

  return {
    service: "notifier",
    status: result.status,
    runtime: "node",
    database: result.database,
    executedAt
  };
}

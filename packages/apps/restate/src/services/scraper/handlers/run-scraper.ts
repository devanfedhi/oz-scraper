import * as restate from "@restatedev/restate-sdk";

import { databaseHealthcheckStepRetryPolicy } from "../../shared/steps/database-healthcheck/database-healthcheck.policy.js";
import { runDatabaseHealthcheckStep } from "../../shared/steps/database-healthcheck/database-healthcheck.js";
import type { ScraperRunResult } from "../scraper.types.js";

export async function runScraper(ctx: restate.Context): Promise<ScraperRunResult> {
  const executedAt = new Date(await ctx.date.now()).toISOString();
  const result = await ctx.run(
    "database-healthcheck",
    runDatabaseHealthcheckStep,
    databaseHealthcheckStepRetryPolicy
  );

  return {
    service: "scraper",
    status: result.status,
    runtime: "node",
    database: result.database,
    executedAt
  };
}

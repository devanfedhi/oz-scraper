import * as restate from "@restatedev/restate-sdk";

import {
  DEAL_PARSER_CRON_JOB_PRESET_NAME,
  type DealParserRunRequest,
  type DealParserRunResult
} from "../deal-parser.types.js";

export async function runDealParser(
  ctx: restate.Context,
  request: DealParserRunRequest
): Promise<DealParserRunResult> {
  const executedAt = new Date(await ctx.date.now());
  const execuateAtIsoString = executedAt.toISOString();

  return {
    service: DEAL_PARSER_CRON_JOB_PRESET_NAME,
    status: "ok",
    externalId: request.externalId,
    executedAt: execuateAtIsoString
  };
}

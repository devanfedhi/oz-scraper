import * as restate from "@restatedev/restate-sdk";
import { inspect } from "node:util";

import {
  DEAL_PARSER_CRON_JOB_PRESET_NAME,
  type DealParserRunRequest,
  type DealParserRunResult
} from "../deal-parser.types.js";
import { fetchOzBargainDealByIdStepRetryPolicy } from "../steps/fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.policy.js";
import { fetchOzBargainDealById } from "../steps/fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.js";
import { parseDealDataToEntity } from "../steps/parse-deal-data-to-entity/parse-deal-data-to-entity.js";

export async function runDealParser(
  ctx: restate.Context,
  request: DealParserRunRequest
): Promise<DealParserRunResult> {
  const executedAt = new Date(await ctx.date.now());
  const executedAtIsoString = executedAt.toISOString();
  try {
    const fetchedDeal = await ctx.run(
      "fetch-ozbargain-deal-by-id",
      () => fetchOzBargainDealById(request.externalId),
      fetchOzBargainDealByIdStepRetryPolicy
    );
    console.log(inspect(fetchedDeal, { depth: null, colors: true }));
    const parsedDeal = await ctx.run("parse-deal-data-to-entity", () =>
      parseDealDataToEntity(fetchedDeal, {
        scrapedAt: executedAt
      })
    );
    console.log(inspect(parsedDeal, { depth: null, colors: true }));

    return {
      service: DEAL_PARSER_CRON_JOB_PRESET_NAME,
      status: "ok",
      externalId: request.externalId,
      sourceUrl: parsedDeal.sourceUrl,
      executedAt: executedAtIsoString
    };
  } catch (error) {
    console.error(`Parser run for deal with ID ["${request.externalId}"] failed`, error);
    throw error;
  }
}

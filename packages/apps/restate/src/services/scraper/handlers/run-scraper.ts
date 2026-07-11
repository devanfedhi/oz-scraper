import * as restate from "@restatedev/restate-sdk";

import { dealParserService } from "../../deal-parser/deal-parser.js";
import { SCRAPER_CRON_JOB_PRESET_NAME, type ScraperRunResult } from "../scraper.types.js";
import { fetchOzBargainDealsStepRetryPolicy } from "../steps/fetch-ozbargain-deals/fetch-ozbargain-deals.policy.js";
import {
  fetchOzBargainDeals,
  OZBARGAIN_DEALS_API_URL
} from "../steps/fetch-ozbargain-deals/fetch-ozbargain-deals.js";

export async function runScraper(ctx: restate.Context): Promise<ScraperRunResult> {
  const executedAt = new Date(await ctx.date.now());
  const execuateAtIsoString = executedAt.toISOString();

  try {
    const dealsResponse = await ctx.run(
      "fetch-ozbargain-deals",
      fetchOzBargainDeals,
      fetchOzBargainDealsStepRetryPolicy
    );

    const dealParserClient = ctx.serviceSendClient(dealParserService);
    for (const externalId of dealsResponse.externalIds) {
      dealParserClient.run(
        { externalId },
        restate.rpc.sendOpts({
          idempotencyKey: `deal-parser//${externalId}//${execuateAtIsoString}`
        })
      );
    }

    return {
      service: SCRAPER_CRON_JOB_PRESET_NAME,
      status: "ok",
      sourceUrl: OZBARGAIN_DEALS_API_URL,
      fetchedCount: dealsResponse.externalIds.length,
      executedAt: execuateAtIsoString
    };
  } catch (error) {
    console.error("Scraper run failed", error);

    return {
      service: SCRAPER_CRON_JOB_PRESET_NAME,
      status: "failed",
      sourceUrl: OZBARGAIN_DEALS_API_URL,
      fetchedCount: 0,
      executedAt: execuateAtIsoString
    };
  }
}

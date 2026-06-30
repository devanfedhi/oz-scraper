import type { Deal } from "@oz-scraper/types";

import type { Database } from "./client.js";
import { deals } from "./schema.js";

export async function insertDeals(database: Database, parsedDeals: Deal[]) {
  if (parsedDeals.length === 0) {
    return;
  }

  await database.db
    .insert(deals)
    .values(
      parsedDeals.map((deal) => ({
        id: deal.id,
        externalId: deal.externalId,
        title: deal.title,
        postedAt: deal.postedAt,
        scrapedAt: deal.scrapedAt
      }))
    )
    .onConflictDoNothing();
}

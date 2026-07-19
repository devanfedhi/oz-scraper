// import type { Deal } from "@oz-scraper/types";
//
// import type { DatabaseClient } from "./client.js";
// import { deals } from "./schema.js";
//
// Temporarily commented out while the DB schema catches up to the richer Deal shape.
// export async function insertDeals(database: DatabaseClient, parsedDeals: Deal[]) {
//   if (parsedDeals.length === 0) {
//     return;
//   }
//
//   await database.db
//     .insert(deals)
//     .values(
//       parsedDeals.map((deal) => ({
//         id: deal.id,
//         externalId: deal.externalId,
//         title: deal.title,
//         postedAt: deal.postedAt,
//         scrapedAt: deal.scrapedAt
//       }))
//     )
//     .onConflictDoNothing();
// }

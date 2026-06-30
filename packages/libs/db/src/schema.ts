import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey(),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull()
  },
  (table) => ({
    externalIdUnique: unique("deals_external_id_unique").on(table.externalId),
    externalIdIdx: index("deals_external_id_idx").on(table.externalId)
  })
);

export type DealRow = typeof deals.$inferSelect;
export type NewDealRow = typeof deals.$inferInsert;

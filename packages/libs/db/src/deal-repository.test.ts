import { describe, expect, it, vi } from "vitest";

import { insertDeals } from "./deal-repository.js";

describe("insertDeals", () => {
  it("skips inserts when there are no deals", async () => {
    const values = vi.fn();
    const insert = vi.fn(() => ({ values }));
    const database = {
      db: {
        insert
      }
    };

    await insertDeals(database as never, []);

    expect(insert).not.toHaveBeenCalled();
    expect(values).not.toHaveBeenCalled();
  });

  it("inserts mapped deal rows and ignores conflicts", async () => {
    const onConflictDoNothing = vi.fn();
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));
    const database = {
      db: {
        insert
      }
    };
    const deals = [
      {
        id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
        externalId: "listing-123",
        title: "First listing",
        postedAt: new Date("2026-07-01T00:00:00.000Z"),
        scrapedAt: new Date("2026-07-01T00:05:00.000Z")
      }
    ];

    await insertDeals(database as never, deals);

    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith([
      {
        id: deals[0].id,
        externalId: deals[0].externalId,
        title: deals[0].title,
        postedAt: deals[0].postedAt,
        scrapedAt: deals[0].scrapedAt
      }
    ]);
    expect(onConflictDoNothing).toHaveBeenCalledOnce();
  });
});

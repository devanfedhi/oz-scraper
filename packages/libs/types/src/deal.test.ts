import { describe, expect, it } from "vitest";

import { dealSchema } from "./deal.js";

describe("dealSchema", () => {
  it("coerces ISO string dates into Date instances", () => {
    const result = dealSchema.parse({
      id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      externalId: "listing-123",
      title: "Test listing",
      postedAt: "2026-07-01T00:00:00.000Z",
      scrapedAt: "2026-07-01T00:05:00.000Z"
    });

    expect(result.postedAt).toBeInstanceOf(Date);
    expect(result.scrapedAt).toBeInstanceOf(Date);
  });

  it("rejects invalid ids", () => {
    expect(() =>
      dealSchema.parse({
        id: "not-a-uuid",
        externalId: "listing-123",
        title: "Test listing",
        postedAt: "2026-07-01T00:00:00.000Z",
        scrapedAt: "2026-07-01T00:05:00.000Z"
      })
    ).toThrow();
  });
});

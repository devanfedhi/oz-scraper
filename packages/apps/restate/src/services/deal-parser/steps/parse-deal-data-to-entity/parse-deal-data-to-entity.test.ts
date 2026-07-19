import { describe, expect, it, vi } from "vitest";
import { TerminalError, type Context } from "@restatedev/restate-sdk";

import { parseDealDataToEntity } from "./parse-deal-data-to-entity.js";

import type { FetchedOzBargainDealById } from "../fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.types.js";

const DEAL_ID = "b9f0c89c-0d03-4d35-92be-96dd055d4c0b";
const SCRAPED_AT = new Date("2026-07-18T00:05:00.000Z");

type FetchedDealOverrides = {
  externalId?: string;
  scrapedData?: Partial<FetchedOzBargainDealById["scrapedData"]>;
  sourceUrl?: string;
  structuredData?: Partial<NonNullable<FetchedOzBargainDealById["structuredData"]>> | null;
};

type ParseContextOptions = {
  dealId?: string;
  scrapedAt?: Date;
};

function buildFetchedDeal(overrides: FetchedDealOverrides = {}): FetchedOzBargainDealById {
  return {
    externalId: overrides.externalId ?? "967471",
    sourceUrl: overrides.sourceUrl ?? "https://www.ozbargain.com.au/node/967471",
    structuredData:
      overrides.structuredData === null
        ? null
        : {
            author: {
              name: "Example Author",
              url: "https://www.ozbargain.com.au/user/123"
            },
            commentCount: 12,
            dateModified: "2026-07-18T11:00:00+1000",
            datePublished: "2026-07-18T10:40:05+1000",
            headline: "Example deal",
            image: "https://files.ozbargain.com.au/n/71/967471l.jpg?h=abc123",
            keywords: ["Electrical & Electronics", "Headphones"],
            name: "Example deal",
            ...overrides.structuredData
          },
    scrapedData: {
      actualDealUrl: "https://example.com/deal",
      clickCount: 75,
      couponCode: null,
      descriptionText: "Body copy",
      endDateText: "31 Jul 11:59pm",
      isAffiliate: false,
      isFreebie: false,
      labels: ["long running"],
      merchantDomainText: "merchant.example",
      ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/967471",
      relatedStores: [
        {
          dealProfileUrl: "https://www.ozbargain.com.au/deals/example.com",
          marker: "Marketplace",
          name: "Example Store"
        }
      ],
      startDateText: "From 21 Jul 8:00am",
      voteCountNegative: 2,
      voteCountPositive: 5,
      ...overrides.scrapedData
    }
  };
}

function buildParseContext(options: ParseContextOptions = {}): Context {
  return {
    date: {
      now: vi.fn().mockResolvedValue((options.scrapedAt ?? SCRAPED_AT).getTime())
    },
    rand: {
      uuidv4: vi.fn().mockReturnValue(options.dealId ?? DEAL_ID)
    }
  } as never;
}

async function parseFetchedDeal(
  fetchedDeal: FetchedOzBargainDealById,
  options: ParseContextOptions = {}
) {
  return parseDealDataToEntity(buildParseContext(options), fetchedDeal);
}

describe("parseDealDataToEntity", () => {
  it("generates entity metadata from Restate context helpers", async () => {
    const ctx = buildParseContext({
      dealId: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      scrapedAt: new Date("2026-07-19T07:15:00.000Z")
    });

    const result = await parseDealDataToEntity(ctx, buildFetchedDeal());

    expect(result.id).toBe("35a6d3cb-875d-4a24-8f95-7319bf3afc34");
    expect(result.scrapedAt.toISOString()).toBe("2026-07-19T07:15:00.000Z");
    expect(ctx.rand.uuidv4).toHaveBeenCalledOnce();
    expect(ctx.date.now).toHaveBeenCalledOnce();
  });

  it("maps fetched deal data into a normalized deal entity and relation collections", async () => {
    const result = await parseFetchedDeal(
      {
        externalId: "968074",
        sourceUrl: "https://www.ozbargain.com.au/node/968074",
        structuredData: {
          author: {
            name: "forbarg",
            url: "https://www.ozbargain.com.au/user/323336"
          },
          commentCount: 25,
          dateModified: "2026-07-17T10:39:37+1000",
          datePublished: "2026-07-16T18:06:12+1000",
          headline:
            "Sony WH-1000XM5 Noise Cancelling Headphones $316 + Delivery ($0 C&C/ in-Store) @ The Good Guys",
          image: "https://files.ozbargain.com.au/n/74/968074l.jpg?h=545c466b",
          keywords: [
            "Electrical & Electronics",
            "Active Noise Cancelling Headphones",
            "Headphones",
            "Sony",
            "Sony WH-1000XM5",
            "Wireless Headphones"
          ],
          mainEntityOfPage: "https://www.ozbargain.com.au/node/968074",
          name: "Sony WH-1000XM5 Noise Cancelling Headphones $316 + Delivery ($0 C&C/ in-Store) @ The Good Guys"
        },
        scrapedData: {
          actualDealUrl:
            "https://www.thegoodguys.com.au/sony-premium-noise-cancelling-headphones-wh1000xm5b",
          clickCount: 1567,
          couponCode: null,
          descriptionText:
            "Got the targeted 20% off Perks cover email/code. You can stack it with the current $30 off code.",
          endDateText: "19 Jul Tomorrow",
          isAffiliate: false,
          isFreebie: false,
          labels: ["targeted"],
          merchantDomainText: "thegoodguys.com.au",
          ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/968074",
          relatedStores: [
            {
              dealProfileUrl: "https://www.ozbargain.com.au/deals/thegoodguys.com.au",
              marker: null,
              name: "The Good Guys"
            }
          ],
          startDateText: null,
          voteCountNegative: 0,
          voteCountPositive: 32
        }
      },
      {
        dealId: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
        scrapedAt: new Date("2026-07-18T00:05:00.000Z")
      }
    );

    expect(result).toMatchObject({
      id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      externalId: "968074",
      label: "targeted",
      sourceUrl: "https://www.ozbargain.com.au/node/968074",
      commentCount: 25,
      authorExternalId: "323336",
      imageUrl: "https://files.ozbargain.com.au/n/74/968074l.jpg?h=545c466b",
      description:
        "Got the targeted 20% off Perks cover email/code. You can stack it with the current $30 off code.",
      clickCount: 1567,
      actualDealUrl:
        "https://www.thegoodguys.com.au/sony-premium-noise-cancelling-headphones-wh1000xm5b",
      ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/968074",
      couponCode: null,
      isAffiliate: false,
      isFreebie: false,
      merchantDomainText: "thegoodguys.com.au",
      voteCountPositive: 32,
      voteCountNegative: 0
    });
    expect(result.publishedAt?.toISOString()).toBe("2026-07-16T08:06:12.000Z");
    expect(result.modifiedAt?.toISOString()).toBe("2026-07-17T00:39:37.000Z");
    expect(result.endDate?.toISOString()).toBe("2026-07-18T14:00:00.000Z");
    expect(result.startDate).toBeNull();
    expect(result.tags.map((tag) => tag.name)).toEqual([
      "Electrical & Electronics",
      "Active Noise Cancelling Headphones",
      "Headphones",
      "Sony",
      "Sony WH-1000XM5",
      "Wireless Headphones"
    ]);
    expect(result.relatedStores).toEqual([
      {
        dealId: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
        dealProfileUrl: "https://www.ozbargain.com.au/deals/thegoodguys.com.au",
        marker: null,
        name: "The Good Guys",
        primary: true
      }
    ]);
  });

  it("parses start and end dates with times using the structured data year and offset", async () => {
    const result = await parseFetchedDeal(
      {
        externalId: "967471",
        sourceUrl: "https://www.ozbargain.com.au/node/967471",
        structuredData: {
          datePublished: "2026-07-18T10:40:05+1000",
          dateModified: "2026-07-18T11:00:00+1000",
          headline: "Example deal",
          image: "https://files.ozbargain.com.au/n/71/967471l.jpg?h=abc123",
          keywords: ["Electrical & Electronics"],
          commentCount: 12,
          author: {
            name: "Example Author",
            url: "https://www.ozbargain.com.au/user/123"
          }
        },
        scrapedData: {
          actualDealUrl: "https://example.com/deal",
          clickCount: 75,
          couponCode: null,
          descriptionText: "Body copy",
          endDateText: "31 Jul 11:59pm",
          isAffiliate: false,
          isFreebie: false,
          labels: ["long running", "long running"],
          merchantDomainText: "merchant.example",
          ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/967471",
          relatedStores: [
            {
              dealProfileUrl: "https://www.ozbargain.com.au/deals/example.com",
              marker: "Marketplace",
              name: "Example Store"
            },
            {
              dealProfileUrl: "https://www.ozbargain.com.au/deals/example.com",
              marker: "Marketplace",
              name: "Example Store"
            }
          ],
          startDateText: "From 21 Jul 8:00am",
          voteCountNegative: 2,
          voteCountPositive: 5
        }
      },
      {
        dealId: "b9f0c89c-0d03-4d35-92be-96dd055d4c0b",
        scrapedAt: new Date("2026-07-18T00:05:00.000Z")
      }
    );

    expect(result.startDate?.toISOString()).toBe("2026-07-20T22:00:00.000Z");
    expect(result.endDate?.toISOString()).toBe("2026-07-31T13:59:00.000Z");
    expect(result.label).toBe("long running");
    expect(result.relatedStores).toEqual([
      {
        dealId: "b9f0c89c-0d03-4d35-92be-96dd055d4c0b",
        dealProfileUrl: "https://www.ozbargain.com.au/deals/example.com",
        marker: "Marketplace",
        name: "Example Store",
        primary: true
      }
    ]);
  });

  it("marks the first distinct related store as primary", async () => {
    const result = await parseFetchedDeal(
      buildFetchedDeal({
        scrapedData: {
          relatedStores: [
            {
              dealProfileUrl: "https://www.ozbargain.com.au/deals/first.example",
              marker: null,
              name: "First Store"
            },
            {
              dealProfileUrl: "https://www.ozbargain.com.au/deals/second.example",
              marker: "Marketplace",
              name: "Second Store"
            }
          ]
        }
      }),
      {
        dealId: DEAL_ID,
        scrapedAt: SCRAPED_AT
      }
    );

    expect(result.relatedStores).toEqual([
      {
        dealId: DEAL_ID,
        dealProfileUrl: "https://www.ozbargain.com.au/deals/first.example",
        marker: null,
        name: "First Store",
        primary: true
      },
      {
        dealId: DEAL_ID,
        dealProfileUrl: "https://www.ozbargain.com.au/deals/second.example",
        marker: "Marketplace",
        name: "Second Store",
        primary: false
      }
    ]);
  });

  it("normalizes tags and uses the first normalized label", async () => {
    const result = await parseFetchedDeal(
      buildFetchedDeal({
        structuredData: {
          keywords: [" Sony ", "", "Sony", " Headphones "]
        },
        scrapedData: {
          labels: [" ", " targeted ", "popular"]
        }
      }),
      {
        dealId: DEAL_ID,
        scrapedAt: SCRAPED_AT
      }
    );

    expect(result.label).toBe("targeted");
    expect(result.tags).toEqual([
      {
        dealId: DEAL_ID,
        name: "Sony"
      },
      {
        dealId: DEAL_ID,
        name: "Headphones"
      }
    ]);
  });

  it("uses a null label when no labels are present", async () => {
    const result = await parseFetchedDeal(
      buildFetchedDeal({
        scrapedData: {
          labels: ["", " "]
        }
      }),
      {
        dealId: DEAL_ID,
        scrapedAt: SCRAPED_AT
      }
    );

    expect(result.label).toBeNull();
  });

  it("parses January dates into the next year for December deals", async () => {
    const result = await parseFetchedDeal(
      buildFetchedDeal({
        structuredData: {
          datePublished: "2026-12-30T10:40:05+1100"
        },
        scrapedData: {
          endDateText: "2 Jan"
        }
      }),
      {
        dealId: DEAL_ID,
        scrapedAt: new Date("2026-12-30T00:05:00.000Z")
      }
    );

    expect(result.endDate?.toISOString()).toBe("2027-01-01T13:00:00.000Z");
  });

  it("uses the source-local reference year around UTC year boundaries", async () => {
    const result = await parseFetchedDeal(
      buildFetchedDeal({
        structuredData: {
          datePublished: "2026-01-01T00:30:00+1100"
        },
        scrapedData: {
          endDateText: "31 Dec"
        }
      }),
      {
        dealId: DEAL_ID,
        scrapedAt: new Date("2025-12-31T13:30:00.000Z")
      }
    );

    expect(result.endDate?.toISOString()).toBe("2026-12-30T13:00:00.000Z");
  });

  it("throws a terminal error when required entity fields are missing", async () => {
    await expect(
      parseFetchedDeal(
        {
          externalId: "967471",
          sourceUrl: "https://www.ozbargain.com.au/node/967471",
          structuredData: {
            headline: "Example deal"
          },
          scrapedData: {
            actualDealUrl: null,
            clickCount: null,
            couponCode: null,
            descriptionText: null,
            endDateText: null,
            isAffiliate: false,
            isFreebie: false,
            labels: [],
            merchantDomainText: null,
            ozbargainGotoUrl: null,
            relatedStores: [],
            startDateText: null,
            voteCountNegative: null,
            voteCountPositive: null
          }
        },
        {
          dealId: "b9f0c89c-0d03-4d35-92be-96dd055d4c0b",
          scrapedAt: new Date("2026-07-18T00:05:00.000Z")
        }
      )
    ).rejects.toThrow(TerminalError);
  });

  it.each([
    [
      "actual deal URL",
      buildFetchedDeal({
        scrapedData: {
          actualDealUrl: "not a url"
        }
      })
    ],
    [
      "OzBargain goto URL",
      buildFetchedDeal({
        scrapedData: {
          ozbargainGotoUrl: "not a url"
        }
      })
    ],
    [
      "image URL",
      buildFetchedDeal({
        structuredData: {
          image: "not a url"
        }
      })
    ],
    [
      "related store profile URL",
      buildFetchedDeal({
        scrapedData: {
          relatedStores: [
            {
              dealProfileUrl: "not a url",
              marker: null,
              name: "Example Store"
            }
          ]
        }
      })
    ]
  ])("throws a terminal error for an invalid required %s", async (_caseName, fetchedDeal) => {
    await expect(
      parseFetchedDeal(fetchedDeal, {
        dealId: DEAL_ID,
        scrapedAt: SCRAPED_AT
      })
    ).rejects.toThrow(TerminalError);
  });

  it.each([
    [
      "published date",
      buildFetchedDeal({
        structuredData: {
          datePublished: undefined
        }
      })
    ],
    [
      "author external id",
      buildFetchedDeal({
        structuredData: {
          author: {
            name: "Example Author",
            url: "https://www.ozbargain.com.au/users/example"
          }
        }
      })
    ],
    [
      "tags",
      buildFetchedDeal({
        structuredData: {
          keywords: []
        }
      })
    ],
    [
      "related stores",
      buildFetchedDeal({
        scrapedData: {
          relatedStores: []
        }
      })
    ]
  ])(
    "throws a terminal error when required %s cannot be parsed",
    async (_caseName, fetchedDeal) => {
      await expect(
        parseFetchedDeal(fetchedDeal, {
          dealId: DEAL_ID,
          scrapedAt: SCRAPED_AT
        })
      ).rejects.toThrow(TerminalError);
    }
  );
});

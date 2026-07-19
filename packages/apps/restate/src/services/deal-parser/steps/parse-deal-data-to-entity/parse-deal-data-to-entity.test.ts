import { describe, expect, it } from "vitest";

import { parseDealDataToEntity } from "./parse-deal-data-to-entity.js";

describe("parseDealDataToEntity", () => {
  it("maps fetched deal data into a normalized deal entity and relation collections", () => {
    const result = parseDealDataToEntity(
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

  it("parses start and end dates with times using the structured data year and offset", () => {
    const result = parseDealDataToEntity(
      {
        externalId: "967471",
        sourceUrl: "https://www.ozbargain.com.au/node/967471",
        structuredData: {
          datePublished: "2026-07-18T10:40:05+1000",
          dateModified: "2026-07-18T11:00:00+1000",
          headline: "Example deal",
          image: "https://files.ozbargain.com.au/n/71/967471l.jpg?h=abc123",
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

  it("throws a terminal error when required entity fields are missing", async () => {
    const restate = await import("@restatedev/restate-sdk");

    expect(() =>
      parseDealDataToEntity(
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
    ).toThrow(restate.TerminalError);
  });
});

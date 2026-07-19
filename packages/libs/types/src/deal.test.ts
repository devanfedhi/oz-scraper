import { describe, expect, it } from "vitest";

import { dealSchema } from "./deal.js";

describe("dealSchema", () => {
  it("coerces the richer deal date fields into Date instances", () => {
    const result = dealSchema.parse({
      id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      externalId: "968074",
      title: "Sony WH-1000XM5",
      label: "targeted",
      sourceUrl: "https://www.ozbargain.com.au/node/968074",
      publishedAt: "2026-07-16T18:06:12+1000",
      modifiedAt: "2026-07-17T10:39:37+1000",
      commentCount: 25,
      authorExternalId: "323336",
      imageUrl: "https://files.ozbargain.com.au/n/74/968074l.jpg?h=545c466b",
      description: "Example description",
      clickCount: 1567,
      actualDealUrl:
        "https://www.thegoodguys.com.au/sony-premium-noise-cancelling-headphones-wh1000xm5b",
      ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/968074",
      couponCode: null,
      endDate: "2026-07-19T00:00:00+10:00",
      startDate: null,
      isAffiliate: false,
      isFreebie: false,
      voteCountPositive: 32,
      voteCountNegative: 0,
      merchantDomainText: "thegoodguys.com.au",
      scrapedAt: "2026-07-18T00:05:00.000Z",
      tags: [],
      relatedStores: []
    });

    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.modifiedAt).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.scrapedAt).toBeInstanceOf(Date);
  });

  it("rejects invalid ids", () => {
    expect(() =>
      dealSchema.parse({
        id: "not-a-uuid",
        externalId: "968074",
        title: "Sony WH-1000XM5",
        label: "targeted",
        sourceUrl: "https://www.ozbargain.com.au/node/968074",
        publishedAt: "2026-07-16T18:06:12+1000",
        modifiedAt: "2026-07-17T10:39:37+1000",
        commentCount: 25,
        authorExternalId: "323336",
        imageUrl: "https://files.ozbargain.com.au/n/74/968074l.jpg?h=545c466b",
        description: "Example description",
        clickCount: 1567,
        actualDealUrl:
          "https://www.thegoodguys.com.au/sony-premium-noise-cancelling-headphones-wh1000xm5b",
        ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/968074",
        couponCode: null,
        endDate: "2026-07-19T00:00:00+10:00",
        startDate: null,
        isAffiliate: false,
        isFreebie: false,
        voteCountPositive: 32,
        voteCountNegative: 0,
        merchantDomainText: "thegoodguys.com.au",
        scrapedAt: "2026-07-18T00:05:00.000Z",
        tags: [],
        relatedStores: []
      })
    ).toThrow();
  });

  it("accepts a deal with loaded relations", () => {
    const result = dealSchema.parse({
      id: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
      externalId: "968074",
      title: "Sony WH-1000XM5",
      label: "targeted",
      sourceUrl: "https://www.ozbargain.com.au/node/968074",
      publishedAt: "2026-07-16T18:06:12+1000",
      modifiedAt: "2026-07-17T10:39:37+1000",
      commentCount: 25,
      authorExternalId: "323336",
      imageUrl: "https://files.ozbargain.com.au/n/74/968074l.jpg?h=545c466b",
      description: "Example description",
      clickCount: 1567,
      actualDealUrl:
        "https://www.thegoodguys.com.au/sony-premium-noise-cancelling-headphones-wh1000xm5b",
      ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/968074",
      couponCode: null,
      endDate: "2026-07-19T00:00:00+10:00",
      startDate: null,
      isAffiliate: false,
      isFreebie: false,
      voteCountPositive: 32,
      voteCountNegative: 0,
      merchantDomainText: "thegoodguys.com.au",
      scrapedAt: "2026-07-18T00:05:00.000Z",
      tags: [
        {
          dealId: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
          name: "Sony"
        }
      ],
      relatedStores: [
        {
          dealId: "35a6d3cb-875d-4a24-8f95-7319bf3afc34",
          name: "The Good Guys",
          dealProfileUrl: "https://www.ozbargain.com.au/deals/thegoodguys.com.au",
          marker: null,
          primary: true
        }
      ]
    });

    expect(result.tags).toHaveLength(1);
    expect(result.label).toBe("targeted");
    expect(result.relatedStores).toHaveLength(1);
  });
});

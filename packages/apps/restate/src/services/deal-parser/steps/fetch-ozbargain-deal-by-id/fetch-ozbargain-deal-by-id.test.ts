import { beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchOzBargainDealById", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("fetches the deal page and extracts the NewsArticle JSON-LD block", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(`
          <html>
            <head>
              <script type="application/ld+json">
                [
                  {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Deals",
                        "item": "https://www.ozbargain.com.au/deals"
                      }
                    ]
                  },
                  {
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": "Example deal",
                    "mainEntityOfPage": "https://www.ozbargain.com.au/node/967471",
                    "datePublished": "2026-07-18T10:40:05+1000",
                    "discussionUrl": "https://www.ozbargain.com.au/node/967471#comment",
                    "author": {
                      "@type": "Person",
                      "name": "Example Author",
                      "url": "https://www.ozbargain.com.au/user/123"
                    }
                  }
                ]
              </script>
            </head>
            <body>
              <li><span class="targeted">targeted</span></li>
              <li><span class="expired">out of stock</span></li>
              <div class="node node-ozbdeal node-page expired soldout" id="node967471">
                <div class="n-left">
                  <div class="n-vote n-deal inact">
                    <span class="nvb voteup"><i class="fa fa-plus"></i><span>27</span></span>
                    <span class="nvb votedown"><i class="fa fa-minus"></i><span>1</span></span>
                  </div>
                </div>
                <div class="n-right">
                  <div class="right">
                    <div class="foxshot-container">
                      <a href="/goto/967471" title="Go to https://example.com/deal?foo=1&amp;bar=2">
                        <img alt="Example deal"/>
                        <span class="overlay overlay-afflink">Affiliate</span>
                      </a>
                    </div>
                  </div>
                  <div class="submitted">
                    <span class="via"><a href="/goto/967471">example.com</a></span>
                    <span class="nodeclicks">(1,234 clicks)</span>
                  </div>
                  <div class="content">
                    <div class="couponcode"><strong>FLEXFREE</strong></div>
                    <p>Line one<br/>Line two &amp; more.</p>
                  </div>
                </div>
              </div>
              <div class="nodeinfo">
                <div class="links">
                  <ul class="links">
                    <li><span class="nodefreebie"><i class="fa fa-tag"></i> Freebie</span></li>
                    <li><span class="nodeexpiry inactive"><i class="fa fa-calendar"></i> From 19 Jul 8:00am <span class="marker">Tomorrow</span></span></li>
                    <li><span class="nodeexpiry"><i class="fa fa-calendar"></i> 20 Jul 8:00am <span class="marker">Sunday</span></span></li>
                  </ul>
                </div>
              </div>
              <h2 class="section" id="relatedstores">Related Stores</h2>
              <section class="relatedstores">
                <article class="storeprofile">
                  <div class="foxshot-container"><a href="/deals/shopback.com.au"></a></div>
                  <div class="name">ShopBack AU<a href="/ozbapi/domain/45612/profile"><i></i></a></div>
                  <div class="marker thirdparty">Third-Party</div>
                </article>
                <article class="storeprofile">
                  <div class="foxshot-container"><a href="/deals/uber.com"></a></div>
                  <div class="name">Uber<a href="/ozbapi/domain/18118/profile"><i></i></a></div>
                </article>
              </section>
            </body>
          </html>
        `)
      })
    );

    const { fetchOzBargainDealById, getOzBargainDealUrlById } =
      await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).resolves.toMatchObject({
      externalId: "967471",
      scrapedData: {
        actualDealUrl: "https://example.com/deal?foo=1&bar=2",
        clickCount: 1234,
        couponCode: "FLEXFREE",
        descriptionText: "FLEXFREE Line one Line two & more.",
        endDateText: "20 Jul 8:00am",
        isAffiliate: true,
        isFreebie: true,
        labels: expect.arrayContaining(["targeted", "out of stock"]),
        merchantDomainText: "example.com",
        ozbargainGotoUrl: "https://www.ozbargain.com.au/goto/967471",
        relatedStores: [
          {
            dealProfileUrl: "https://www.ozbargain.com.au/deals/shopback.com.au",
            marker: "Third-Party",
            name: "ShopBack AU"
          },
          {
            dealProfileUrl: "https://www.ozbargain.com.au/deals/uber.com",
            marker: null,
            name: "Uber"
          }
        ],
        startDateText: "From 19 Jul 8:00am",
        voteCountNegative: 1,
        voteCountPositive: 27
      },
      sourceUrl: "https://www.ozbargain.com.au/node/967471",
      structuredData: {
        author: {
          name: "Example Author",
          url: "https://www.ozbargain.com.au/user/123"
        },
        headline: "Example deal",
        mainEntityOfPage: "https://www.ozbargain.com.au/node/967471"
      }
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(getOzBargainDealUrlById("967471"), {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "oz-scraper/0.0.0 (+https://www.ozbargain.com.au/node)"
      }
    });
  });

  it("keeps only the selected structured data fields from the NewsArticle payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(`
          <html>
            <head>
              <script type="application/ld+json">
                [
                  {
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": "Structured example",
                    "name": "Structured example",
                    "image": "https://files.example/image.jpg",
                    "datePublished": "2026-07-18T10:40:05+1000",
                    "dateModified": "2026-07-18T10:41:05+1000",
                    "mainEntityOfPage": "https://www.ozbargain.com.au/node/123456",
                    "keywords": ["Audio", "Sony"],
                    "commentCount": 42,
                    "discussionUrl": "https://www.ozbargain.com.au/node/123456#comment",
                    "publisher": {
                      "@type": "Organization",
                      "name": "OzBargain"
                    },
                    "author": {
                      "@type": "Person",
                      "name": "Example Author",
                      "url": "https://www.ozbargain.com.au/user/123"
                    }
                  }
                ]
              </script>
            </head>
            <body><div class="nodeinfo"></div></body>
          </html>
        `)
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("123456")).resolves.toMatchObject({
      structuredData: {
        author: {
          name: "Example Author",
          url: "https://www.ozbargain.com.au/user/123"
        },
        commentCount: 42,
        dateModified: "2026-07-18T10:41:05+1000",
        datePublished: "2026-07-18T10:40:05+1000",
        headline: "Structured example",
        image: "https://files.example/image.jpg",
        keywords: ["Audio", "Sony"],
        mainEntityOfPage: "https://www.ozbargain.com.au/node/123456",
        name: "Structured example"
      }
    });

    const result = await fetchOzBargainDealById("123456");
    expect(result.structuredData).not.toHaveProperty("discussionUrl");
    expect(result.structuredData).not.toHaveProperty("publisher");
    expect(result.structuredData).not.toHaveProperty("@context");
    expect(result.structuredData).not.toHaveProperty("@type");
  });

  it("uses only visible label text and ignores node classes when no visible labels are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(`
          <html>
            <body>
              <div class="node node-ozbdeal node-page expired soldout" id="node967471">
                <div class="n-left"></div>
                <div class="n-right">
                  <div class="content"><p>No visible labels</p></div>
                </div>
              </div>
              <div class="nodeinfo">
                <div class="links"><ul class="links"></ul></div>
              </div>
            </body>
          </html>
        `)
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).resolves.toMatchObject({
      scrapedData: {
        labels: []
      }
    });
  });

  it("extracts end dates, start dates, and related store metadata independently", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(`
          <html>
            <body>
              <div class="messages node">
                <ul>
                  <li><span class="longrunning">long running</span></li>
                </ul>
              </div>
              <h1>Deal</h1>
              <div class="node node-ozbdeal node-page" id="node967471">
                <div class="n-left">
                  <div class="n-vote n-deal inact">
                    <span class="nvb voteup"><i class="fa fa-plus"></i><span>5</span></span>
                    <span class="nvb votedown"><i class="fa fa-minus"></i><span>2</span></span>
                  </div>
                </div>
                <div class="n-right">
                  <div class="right">
                    <div class="foxshot-container">
                      <a href="/goto/967471" title="Go to https://example.com/path">
                        <img alt="Example deal"/>
                      </a>
                    </div>
                  </div>
                  <div class="submitted">
                    <span class="via"><a href="/goto/967471">merchant.example</a></span>
                    <span class="nodeclicks">(75 clicks)</span>
                  </div>
                  <div class="content"><p>Body copy</p></div>
                </div>
              </div>
              <div class="nodeinfo">
                <div class="links">
                  <ul class="links">
                    <li><span class="nodeexpiry inactive"><i class="fa fa-calendar"></i> From 21 Jul 8:00am <span class="marker">Tuesday</span></span></li>
                    <li><span class="nodeexpiry"><i class="fa fa-calendar"></i> 31 Jul 11:59pm <span class="marker">13 days left</span></span></li>
                  </ul>
                </div>
              </div>
              <section class="relatedstores">
                <article class="storeprofile">
                  <div class="foxshot-container"><a href="/deals/example.com"></a></div>
                  <div class="name">Example Store<a href="/ozbapi/domain/1/profile"><i></i></a></div>
                  <div class="marker">Marketplace</div>
                </article>
              </section>
            </body>
          </html>
        `)
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).resolves.toMatchObject({
      scrapedData: {
        clickCount: 75,
        descriptionText: "Body copy",
        endDateText: "31 Jul 11:59pm",
        labels: ["long running"],
        merchantDomainText: "merchant.example",
        relatedStores: [
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
    });
  });

  it("returns null structured data when json-ld is present but does not contain a NewsArticle", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(`
          <html>
            <head>
              <script type="application/ld+json">
                [{ "@context": "https://schema.org", "@type": "BreadcrumbList" }]
              </script>
            </head>
            <body><div class="nodeinfo"></div></body>
          </html>
        `)
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).resolves.toMatchObject({
      structuredData: null
    });
  });

  it("returns null structuredData when no json-ld block is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue("<html><body>No structured data</body></html>")
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).resolves.toMatchObject({
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
      },
      structuredData: null
    });
  });

  it("throws a terminal error for non-retryable http errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found"
      })
    );

    const restate = await import("@restatedev/restate-sdk");
    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).rejects.toBeInstanceOf(restate.TerminalError);
  });

  it("throws a retryable error for 500 http errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      })
    );

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).rejects.toThrow(
      "[TRANSIENT] Failed to fetch OzBargain deal 967471: 500 Internal Server Error"
    );
  });

  it("throws a retryable error for network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hang up")));

    const { fetchOzBargainDealById } = await import("./fetch-ozbargain-deal-by-id.js");

    await expect(fetchOzBargainDealById("967471")).rejects.toThrow(
      "[TRANSIENT] Failed to fetch OzBargain deal 967471 due to a network error: socket hang up"
    );
  });
});

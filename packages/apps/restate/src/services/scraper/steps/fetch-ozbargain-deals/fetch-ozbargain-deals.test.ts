import { beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchOzBargainDeals", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns only the extracted externalIds from the live api response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          records: [
            { link: "/node/967471" },
            { link: "/node/967469" },
            { link: "/deal/ignore-me" },
            {}
          ]
        })
      })
    );

    const { fetchOzBargainDeals, OZBARGAIN_DEALS_API_URL } =
      await import("./fetch-ozbargain-deals.js");

    await expect(fetchOzBargainDeals()).resolves.toEqual({
      externalIds: ["967471", "967469"]
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(OZBARGAIN_DEALS_API_URL, {
      headers: {
        accept: "application/json,text/plain,*/*",
        "user-agent": "oz-scraper/0.0.0 (+https://www.ozbargain.com.au/api/live)"
      }
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
    const { fetchOzBargainDeals } = await import("./fetch-ozbargain-deals.js");

    await expect(fetchOzBargainDeals()).rejects.toBeInstanceOf(restate.TerminalError);
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

    const { fetchOzBargainDeals } = await import("./fetch-ozbargain-deals.js");

    await expect(fetchOzBargainDeals()).rejects.toThrow(
      "[TRANSIENT] Failed to fetch OzBargain deals: 500 Internal Server Error"
    );
  });

  it("throws a retryable error for network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hang up")));

    const { fetchOzBargainDeals } = await import("./fetch-ozbargain-deals.js");

    await expect(fetchOzBargainDeals()).rejects.toThrow(
      "[TRANSIENT] Failed to fetch OzBargain deals due to a network error: socket hang up"
    );
  });
});

import * as restate from "@restatedev/restate-sdk";

import type {
  FetchedOzBargainDeals,
  OzBargainLiveResponse
} from "./fetch-ozbargain-deals.types.js";

export const OZBARGAIN_DEALS_API_URL =
  "https://www.ozbargain.com.au/api/live?last=0&disable=comments,votes,wiki&types=Comp,Forum";

export async function fetchOzBargainDeals(): Promise<FetchedOzBargainDeals> {
  let response: Response;

  try {
    response = await fetch(OZBARGAIN_DEALS_API_URL, {
      headers: {
        accept: "application/json,text/plain,*/*",
        "user-agent": "oz-scraper/0.0.0 (+https://www.ozbargain.com.au/api/live)"
      }
    });
  } catch (error) {
    const message = `[TRANSIENT] Failed to fetch OzBargain deals due to a network error: ${
      (error as Error).message
    }`;
    console.error(message, error);
    throw new Error(message);
  }

  if (!response.ok) {
    const label = response.status >= 500 ? "[TRANSIENT]" : "[TERMINAL]";
    const message = `${label} Failed to fetch OzBargain deals: ${response.status} ${response.statusText}`;

    console.error(message);

    if (response.status >= 500) {
      throw new Error(message);
    }

    throw new restate.TerminalError(message);
  }

  const responseBody = (await response.json()) as OzBargainLiveResponse;

  return {
    externalIds: responseBody.records.flatMap((record) => {
      const externalId = record.link?.match(/^\/node\/(?<externalId>\d+)$/u)?.groups?.externalId;

      return externalId ? [externalId] : [];
    })
  };
}

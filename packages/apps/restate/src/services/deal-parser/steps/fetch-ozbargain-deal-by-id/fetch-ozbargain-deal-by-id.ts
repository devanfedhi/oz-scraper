import * as restate from "@restatedev/restate-sdk";

import type {
  FetchedOzBargainDealById,
  OzBargainDealScrapedData,
  OzBargainDealStructuredData,
  OzBargainRelatedStore
} from "./fetch-ozbargain-deal-by-id.types.js";

const OZBARGAIN_BASE_URL = "https://www.ozbargain.com.au";

const HTML_ENTITY_REPLACEMENTS: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&#039;": "'",
  "&#39;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"'
};

function decodeHtmlEntities(value: string): string {
  const withNamedEntities = value.replace(
    /&(amp|apos|gt|lt|nbsp|quot|#039|#39);/gu,
    (entity) => HTML_ENTITY_REPLACEMENTS[entity] ?? entity
  );

  return withNamedEntities.replace(/&#(?<code>\d+);/gu, (_, code: string) =>
    String.fromCodePoint(Number.parseInt(code, 10))
  );
}

function stripHtmlToFlatText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/giu, "\n")
      .replace(/<\/(p|div|li|ul|ol|blockquote|h\d)>/giu, "\n")
      .replace(/<[^>]+>/gu, " ")
  )
    .replace(/\s+/gu, " ")
    .trim();
}

function toAbsoluteOzBargainUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  return new URL(path, OZBARGAIN_BASE_URL).toString();
}

function extractFirstMatchGroup(html: string, pattern: RegExp, group = 1): string | null {
  const match = html.match(pattern);

  return match?.[group]?.trim() ?? null;
}

function extractNamedMatchGroup(html: string, pattern: RegExp, group: string): string | null {
  const match = html.match(pattern);

  return match?.groups?.[group]?.trim() ?? null;
}

function extractDealContentHtml(html: string): string | null {
  const contentStart = html.indexOf('<div class="content">');

  if (contentStart === -1) {
    return null;
  }

  const nodeInfoStart = html.indexOf('<div class="nodeinfo">', contentStart);

  if (nodeInfoStart === -1) {
    return null;
  }

  const contentHtml = html
    .slice(contentStart + '<div class="content">'.length, nodeInfoStart)
    .replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/u, "")
    .trim();

  return contentHtml || null;
}

function extractLabels(html: string): string[] {
  const labels = new Set<string>();
  const labelHtml =
    html.match(
      /<div class="messages node">[\s\S]*?<\/div>\s*<h1[\s\S]*?<div class="n-left">/iu
    )?.[0] ?? html;

  for (const match of labelHtml.matchAll(
    /<li>\s*<span class="[^"]+">(?<text>[^<]+)<\/span>\s*<\/li>/giu
  )) {
    const labelText = match.groups?.text?.trim().toLowerCase();

    if (labelText) {
      labels.add(labelText);
    }
  }

  return [...labels];
}

function extractDateText(html: string, className: string): string | null {
  const match = html.match(
    new RegExp(
      `<span class="nodeexpiry${className}"[^>]*>(?<content>[\\s\\S]*?)<span class="marker">[\\s\\S]*?<\\/span>[\\s\\S]*?<\\/span>|<span class="nodeexpiry${className}"[^>]*>(?<contentWithoutMarker>[\\s\\S]*?)<\\/span>`,
      "iu"
    )
  );
  const rawText = (match?.groups?.content ?? match?.groups?.contentWithoutMarker)
    ?.replace(/<i[^>]*>[\s\S]*?<\/i>/giu, "")
    ?.replace(/<span class="marker">[\s\S]*?<\/span>/giu, "")
    .trim();

  if (!rawText) {
    return null;
  }

  return stripHtmlToFlatText(rawText);
}

function extractRelatedStores(html: string): OzBargainRelatedStore[] {
  const relatedStoresSection = html.match(
    /<section class="relatedstores">(?<stores>[\s\S]*?)<\/section>/iu
  )?.groups?.stores;

  if (!relatedStoresSection) {
    return [];
  }

  const relatedStores: OzBargainRelatedStore[] = [];

  for (const storeMatch of relatedStoresSection.matchAll(
    /<article class="storeprofile"[\s\S]*?<a href="(?<dealProfilePath>\/deals\/[^"]+)"[\s\S]*?<div class="name">(?<name>[\s\S]*?)<a href="\/ozbapi\/domain\/[^"]+"[\s\S]*?<\/div>\s*(?:<div class="marker[^"]*">(?<marker>[^<]+)<\/div>)?[\s\S]*?<\/article>/giu
  )) {
    const name = stripHtmlToFlatText(storeMatch.groups?.name ?? "");

    relatedStores.push({
      dealProfileUrl: toAbsoluteOzBargainUrl(storeMatch.groups?.dealProfilePath ?? null),
      marker: decodeHtmlEntities(storeMatch.groups?.marker?.trim() ?? "") || null,
      name
    });
  }

  return relatedStores;
}

function extractScrapedDataFromHtml(html: string): OzBargainDealScrapedData {
  const gotoMatch = html.match(
    /<a href="(?<href>\/goto\/\d+)"[^>]*title="Go to (?<target>[^"]+)"/iu
  );
  const clickCountText = extractNamedMatchGroup(
    html,
    /<span[^>]*class="nodeclicks"[^>]*>\((?<count>[\d,]+) clicks\)<\/span>/iu,
    "count"
  );
  const voteUpText = extractNamedMatchGroup(
    html,
    /<span class="nvb voteup">[\s\S]*?<span>(?<count>\d+)<\/span>[\s\S]*?<\/span>/iu,
    "count"
  );
  const voteDownText = extractNamedMatchGroup(
    html,
    /<span class="nvb votedown">[\s\S]*?<span>(?<count>\d+)<\/span>[\s\S]*?<\/span>/iu,
    "count"
  );
  const couponCode = extractNamedMatchGroup(
    html,
    /<div class="couponcode"[^>]*>[\s\S]*?<strong>(?<code>[^<]+)<\/strong>[\s\S]*?<\/div>/iu,
    "code"
  );
  const merchantDomainText = extractNamedMatchGroup(
    html,
    /<span class="via">[\s\S]*?<a href="\/goto\/\d+"[^>]*>(?<domain>[^<]+)<\/a>/iu,
    "domain"
  );
  const contentHtml = extractDealContentHtml(html);

  return {
    actualDealUrl: decodeHtmlEntities(gotoMatch?.groups?.target ?? "") || null,
    clickCount: clickCountText ? Number.parseInt(clickCountText.replaceAll(",", ""), 10) : null,
    couponCode: decodeHtmlEntities(couponCode ?? "") || null,
    descriptionText: contentHtml ? stripHtmlToFlatText(contentHtml) : null,
    endDateText: extractDateText(html, '(?![^"]*inactive)[^"]*'),
    isAffiliate: html.includes("overlay-afflink") || html.includes('class="affdisclosure"'),
    isFreebie: html.includes('class="nodefreebie"'),
    labels: extractLabels(html),
    merchantDomainText: decodeHtmlEntities(merchantDomainText ?? "") || null,
    ozbargainGotoUrl: toAbsoluteOzBargainUrl(gotoMatch?.groups?.href ?? null),
    relatedStores: extractRelatedStores(html),
    startDateText: extractDateText(html, '[^"]* inactive'),
    voteCountNegative: voteDownText ? Number.parseInt(voteDownText, 10) : null,
    voteCountPositive: voteUpText ? Number.parseInt(voteUpText, 10) : null
  };
}

export function getOzBargainDealUrlById(externalId: string): string {
  return `${OZBARGAIN_BASE_URL}/node/${externalId}`;
}

function extractJsonLdCandidates(html: string): unknown[] {
  const candidates: unknown[] = [];
  const scriptBlocks = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(?<json>[\s\S]*?)<\/script>/giu
  );

  for (const block of scriptBlocks) {
    const json = block.groups?.json?.trim();

    if (!json) {
      continue;
    }

    try {
      const parsed = JSON.parse(json) as unknown;
      candidates.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (error) {
      console.warn("Failed to parse OzBargain JSON-LD block", error);
    }
  }

  return candidates;
}

function extractStructuredDataFromHtml(html: string): OzBargainDealStructuredData | null {
  for (const candidate of extractJsonLdCandidates(html)) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "@type" in candidate &&
      candidate["@type"] === "NewsArticle"
    ) {
      const article = candidate as {
        author?: { name?: string; url?: string };
        commentCount?: number;
        dateModified?: string;
        datePublished?: string;
        headline?: string;
        image?: string;
        keywords?: string[];
        mainEntityOfPage?: string;
        name?: string;
        url?: string;
      };

      return {
        author: article.author
          ? {
              name: article.author.name,
              url: article.author.url
            }
          : undefined,
        commentCount: article.commentCount,
        dateModified: article.dateModified,
        datePublished: article.datePublished,
        headline: article.headline,
        image: article.image,
        keywords: article.keywords,
        mainEntityOfPage: article.mainEntityOfPage,
        name: article.name,
        url: article.url
      };
    }
  }

  return null;
}

export async function fetchOzBargainDealById(
  externalId: string
): Promise<FetchedOzBargainDealById> {
  const sourceUrl = getOzBargainDealUrlById(externalId);
  let response: Response;

  try {
    response = await fetch(sourceUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "oz-scraper/0.0.0 (+https://www.ozbargain.com.au/node)"
      }
    });
  } catch (error) {
    const message = `[TRANSIENT] Failed to fetch OzBargain deal ${externalId} due to a network error: ${
      (error as Error).message
    }`;
    console.error(message, error);
    throw new Error(message);
  }

  if (!response.ok) {
    const label = response.status >= 500 ? "[TRANSIENT]" : "[TERMINAL]";
    const message = `${label} Failed to fetch OzBargain deal ${externalId}: ${response.status} ${response.statusText}`;

    console.error(message);

    if (response.status >= 500) {
      throw new Error(message);
    }

    throw new restate.TerminalError(message);
  }

  const html = await response.text();

  return {
    externalId,
    sourceUrl,
    structuredData: extractStructuredDataFromHtml(html),
    scrapedData: extractScrapedDataFromHtml(html)
  };
}

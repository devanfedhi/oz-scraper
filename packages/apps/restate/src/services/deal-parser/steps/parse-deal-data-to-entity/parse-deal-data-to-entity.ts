import * as restate from "@restatedev/restate-sdk";
import { randomUUID } from "node:crypto";

import { dealSchema, type Deal, type DealRelatedStore, type DealTag } from "@oz-scraper/types";

import type { FetchedOzBargainDealById } from "../fetch-ozbargain-deal-by-id/fetch-ozbargain-deal-by-id.types.js";

const MONTH_INDEX_BY_NAME: Record<string, number> = {
  apr: 3,
  aug: 7,
  dec: 11,
  feb: 1,
  jan: 0,
  jul: 6,
  jun: 5,
  mar: 2,
  may: 4,
  nov: 10,
  oct: 9,
  sep: 8
};

function normalizeOffset(rawValue: string | undefined): string {
  const match = rawValue?.match(/(?<hours>[+-]\d{2})(?<minutes>\d{2})$/u);

  if (!match?.groups) {
    return "+10:00";
  }

  return `${match.groups.hours}:${match.groups.minutes}`;
}

function parseOzBargainDateText(
  rawValue: string | null,
  referenceDate: Date | null,
  sourceOffset: string
): Date | null {
  if (!rawValue) {
    return null;
  }

  const match = rawValue
    .replace(/^From\s+/iu, "")
    .match(/^(?<day>\d{1,2})\s+(?<month>[A-Za-z]{3})(?:\s+(?<time>\d{1,2}:\d{2}(?:am|pm)))?/iu);

  if (!match?.groups) {
    return null;
  }

  const monthIndex = MONTH_INDEX_BY_NAME[match.groups.month.toLowerCase()];

  if (monthIndex === undefined) {
    return null;
  }

  const referenceYear = referenceDate?.getUTCFullYear() ?? new Date().getUTCFullYear();
  const referenceMonth = referenceDate?.getUTCMonth();
  const year =
    referenceMonth !== undefined && monthIndex < referenceMonth ? referenceYear + 1 : referenceYear;
  const day = Number.parseInt(match.groups.day, 10);
  const timeText = match.groups.time?.toLowerCase() ?? "12:00am";
  const timeMatch = timeText.match(/^(?<hours>\d{1,2}):(?<minutes>\d{2})(?<period>am|pm)$/u);

  if (!timeMatch?.groups) {
    return null;
  }

  const hours12 = Number.parseInt(timeMatch.groups.hours, 10) % 12;
  const minutes = Number.parseInt(timeMatch.groups.minutes, 10);
  const hours24 = timeMatch.groups.period === "pm" ? hours12 + 12 : hours12;
  const month = String(monthIndex + 1).padStart(2, "0");
  const isoDate = `${year}-${month}-${String(day).padStart(2, "0")}T${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00${sourceOffset}`;
  const parsed = new Date(isoDate);

  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function extractAuthorExternalId(authorUrl: string | undefined): string | null {
  return authorUrl?.match(/\/user\/(?<id>\d+)$/u)?.groups?.id ?? null;
}

function uniqueNames(values: string[] | undefined): string[] {
  const normalized = new Set<string>();

  for (const value of values ?? []) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      continue;
    }

    normalized.add(trimmedValue);
  }

  return [...normalized];
}

function mapTags(dealId: string, keywords: string[] | undefined): DealTag[] {
  return uniqueNames(keywords).map((name) => ({
    dealId,
    name
  }));
}

function mapLabel(labels: string[]): string | null {
  return uniqueNames(labels)[0] ?? null;
}

function mapRelatedStores(
  dealId: string,
  relatedStores: FetchedOzBargainDealById["scrapedData"]["relatedStores"]
): DealRelatedStore[] {
  const storesByKey = new Map<string, DealRelatedStore>();

  for (const relatedStore of relatedStores) {
    const key = `${relatedStore.name.toLowerCase()}::${relatedStore.dealProfileUrl ?? ""}`;

    if (storesByKey.has(key)) {
      continue;
    }

    storesByKey.set(key, {
      dealId,
      name: relatedStore.name,
      dealProfileUrl: relatedStore.dealProfileUrl ?? "",
      marker: relatedStore.marker,
      primary: false
    });
  }

  return [...storesByKey.values()].map((relatedStore, index) => ({
    ...relatedStore,
    primary: index === 0
  }));
}

export type ParseDealDataToEntityOptions = {
  dealId?: string;
  scrapedAt?: Date;
};

export function parseDealDataToEntity(
  fetchedDeal: FetchedOzBargainDealById,
  options: ParseDealDataToEntityOptions = {}
): Deal {
  const dealId = options.dealId ?? randomUUID();
  const scrapedAt = options.scrapedAt ?? new Date();
  const publishedAt = fetchedDeal.structuredData?.datePublished
    ? new Date(fetchedDeal.structuredData.datePublished)
    : null;
  const modifiedAt = fetchedDeal.structuredData?.dateModified
    ? new Date(fetchedDeal.structuredData.dateModified)
    : null;
  const sourceOffset = normalizeOffset(
    fetchedDeal.structuredData?.datePublished ?? fetchedDeal.structuredData?.dateModified
  );
  const referenceDate = publishedAt ?? modifiedAt ?? scrapedAt;

  const parsedDeal = dealSchema.safeParse({
    id: dealId,
    externalId: fetchedDeal.externalId,
    title:
      fetchedDeal.structuredData?.headline ??
      fetchedDeal.structuredData?.name ??
      fetchedDeal.sourceUrl,
    label: mapLabel(fetchedDeal.scrapedData.labels),
    sourceUrl: fetchedDeal.sourceUrl,
    publishedAt,
    modifiedAt,
    commentCount: fetchedDeal.structuredData?.commentCount ?? null,
    authorExternalId: extractAuthorExternalId(fetchedDeal.structuredData?.author?.url),
    imageUrl: fetchedDeal.structuredData?.image ?? null,
    description: fetchedDeal.scrapedData.descriptionText,
    clickCount: fetchedDeal.scrapedData.clickCount,
    actualDealUrl: fetchedDeal.scrapedData.actualDealUrl,
    ozbargainGotoUrl: fetchedDeal.scrapedData.ozbargainGotoUrl,
    couponCode: fetchedDeal.scrapedData.couponCode,
    endDate: parseOzBargainDateText(
      fetchedDeal.scrapedData.endDateText,
      referenceDate,
      sourceOffset
    ),
    startDate: parseOzBargainDateText(
      fetchedDeal.scrapedData.startDateText,
      referenceDate,
      sourceOffset
    ),
    isAffiliate: fetchedDeal.scrapedData.isAffiliate,
    isFreebie: fetchedDeal.scrapedData.isFreebie,
    voteCountPositive: fetchedDeal.scrapedData.voteCountPositive,
    voteCountNegative: fetchedDeal.scrapedData.voteCountNegative,
    merchantDomainText: fetchedDeal.scrapedData.merchantDomainText,
    scrapedAt,
    tags: mapTags(options.dealId ?? dealId, fetchedDeal.structuredData?.keywords),
    relatedStores: mapRelatedStores(options.dealId ?? dealId, fetchedDeal.scrapedData.relatedStores)
  });

  if (!parsedDeal.success) {
    throw new restate.TerminalError(
      `Failed to parse fetched deal ${fetchedDeal.externalId} into a Deal entity: ${parsedDeal.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsedDeal.data;
}

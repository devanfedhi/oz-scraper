import * as restate from "@restatedev/restate-sdk";

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

const OZBARGAIN_TIME_ZONE = "Australia/Melbourne";
const OZBARGAIN_DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: OZBARGAIN_TIME_ZONE,
  year: "numeric"
});

type DateTimeParts = {
  day: number;
  hours: number;
  minutes: number;
  monthIndex: number;
  year: number;
};

function getDateTimePartsInOzBargainTimeZone(date: Date): DateTimeParts {
  const parts = Object.fromEntries(
    OZBARGAIN_DATE_TIME_FORMAT.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    day: Number.parseInt(parts.day, 10),
    hours: Number.parseInt(parts.hour, 10),
    minutes: Number.parseInt(parts.minute, 10),
    monthIndex: Number.parseInt(parts.month, 10) - 1,
    year: Number.parseInt(parts.year, 10)
  };
}

function createDateFromOzBargainTimeZoneParts(parts: DateTimeParts): Date | null {
  const desiredLocalTimestamp = Date.UTC(
    parts.year,
    parts.monthIndex,
    parts.day,
    parts.hours,
    parts.minutes
  );
  const initialGuess = new Date(desiredLocalTimestamp);
  const actualParts = getDateTimePartsInOzBargainTimeZone(initialGuess);
  const actualLocalTimestamp = Date.UTC(
    actualParts.year,
    actualParts.monthIndex,
    actualParts.day,
    actualParts.hours,
    actualParts.minutes
  );
  const adjustedDate = new Date(
    initialGuess.getTime() + desiredLocalTimestamp - actualLocalTimestamp
  );
  const adjustedParts = getDateTimePartsInOzBargainTimeZone(adjustedDate);

  return adjustedParts.year === parts.year &&
    adjustedParts.monthIndex === parts.monthIndex &&
    adjustedParts.day === parts.day &&
    adjustedParts.hours === parts.hours &&
    adjustedParts.minutes === parts.minutes
    ? adjustedDate
    : null;
}

function parseOzBargainDateText(rawValue: string | null, referenceDate: Date): Date | null {
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

  const referenceParts = getDateTimePartsInOzBargainTimeZone(referenceDate);
  const year =
    monthIndex < referenceParts.monthIndex ? referenceParts.year + 1 : referenceParts.year;
  const day = Number.parseInt(match.groups.day, 10);
  const timeText = match.groups.time?.toLowerCase() ?? "12:00am";
  const timeMatch = timeText.match(/^(?<hours>\d{1,2}):(?<minutes>\d{2})(?<period>am|pm)$/u);

  if (!timeMatch?.groups) {
    return null;
  }

  const hours12 = Number.parseInt(timeMatch.groups.hours, 10) % 12;
  const minutes = Number.parseInt(timeMatch.groups.minutes, 10);
  const hours24 = timeMatch.groups.period === "pm" ? hours12 + 12 : hours12;

  return createDateFromOzBargainTimeZoneParts({
    day,
    hours: hours24,
    minutes,
    monthIndex,
    year
  });
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

export async function parseDealDataToEntity(
  ctx: restate.Context,
  fetchedDeal: FetchedOzBargainDealById
): Promise<Deal> {
  const dealId = ctx.rand.uuidv4();
  const scrapedAt = new Date(await ctx.date.now());
  const publishedAt = fetchedDeal.structuredData?.datePublished
    ? new Date(fetchedDeal.structuredData.datePublished)
    : null;
  const modifiedAt = fetchedDeal.structuredData?.dateModified
    ? new Date(fetchedDeal.structuredData.dateModified)
    : null;
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
    endDate: parseOzBargainDateText(fetchedDeal.scrapedData.endDateText, referenceDate),
    startDate: parseOzBargainDateText(fetchedDeal.scrapedData.startDateText, referenceDate),
    isAffiliate: fetchedDeal.scrapedData.isAffiliate,
    isFreebie: fetchedDeal.scrapedData.isFreebie,
    voteCountPositive: fetchedDeal.scrapedData.voteCountPositive,
    voteCountNegative: fetchedDeal.scrapedData.voteCountNegative,
    merchantDomainText: fetchedDeal.scrapedData.merchantDomainText,
    scrapedAt,
    tags: mapTags(dealId, fetchedDeal.structuredData?.keywords),
    relatedStores: mapRelatedStores(dealId, fetchedDeal.scrapedData.relatedStores)
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

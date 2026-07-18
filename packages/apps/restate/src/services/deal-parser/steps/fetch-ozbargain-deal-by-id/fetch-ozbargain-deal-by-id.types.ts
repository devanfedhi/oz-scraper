export type OzBargainDealStructuredData = {
  author?: {
    name?: string;
    url?: string;
  };
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

export type OzBargainRelatedStore = {
  dealProfileUrl: string | null;
  marker: string | null;
  name: string;
};

export type OzBargainDealScrapedData = {
  actualDealUrl: string | null;
  clickCount: number | null;
  couponCode: string | null;
  descriptionText: string | null;
  endDateText: string | null;
  isAffiliate: boolean;
  isFreebie: boolean;
  labels: string[];
  merchantDomainText: string | null;
  ozbargainGotoUrl: string | null;
  relatedStores: OzBargainRelatedStore[];
  startDateText: string | null;
  voteCountNegative: number | null;
  voteCountPositive: number | null;
};

export type FetchedOzBargainDealById = {
  externalId: string;
  sourceUrl: string;
  structuredData: OzBargainDealStructuredData | null;
  scrapedData: OzBargainDealScrapedData;
};

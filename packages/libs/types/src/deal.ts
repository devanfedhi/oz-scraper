import { z } from "zod";

const requiredDateSchema = z.union([z.date(), z.string(), z.number()]).pipe(z.coerce.date());

export const dealTagSchema = z.object({
  dealId: z.string().uuid(),
  name: z.string()
});

export type DealTag = z.infer<typeof dealTagSchema>;

export const dealRelatedStoreSchema = z.object({
  dealId: z.string().uuid(),
  name: z.string(),
  dealProfileUrl: z.string().url(),
  marker: z.string().nullable(),
  primary: z.boolean()
});

export type DealRelatedStore = z.infer<typeof dealRelatedStoreSchema>;

export const dealSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  label: z.string().nullable(),
  sourceUrl: z.string().url(),
  publishedAt: requiredDateSchema,
  modifiedAt: z.coerce.date().nullable(),
  commentCount: z.number().int().nonnegative(),
  authorExternalId: z.string(),
  imageUrl: z.string().url(),
  description: z.string(),
  clickCount: z.number().int().nonnegative(),
  actualDealUrl: z.string().url(),
  ozbargainGotoUrl: z.string().url(),
  couponCode: z.string().nullable(),
  endDate: z.coerce.date().nullable(),
  startDate: z.coerce.date().nullable(),
  isAffiliate: z.boolean(),
  isFreebie: z.boolean(),
  voteCountPositive: z.number().int().nonnegative(),
  voteCountNegative: z.number().int().nonnegative(),
  merchantDomainText: z.string(),
  scrapedAt: requiredDateSchema,
  tags: z.array(dealTagSchema).min(1),
  relatedStores: z.array(dealRelatedStoreSchema).min(1)
});

export type Deal = z.infer<typeof dealSchema>;

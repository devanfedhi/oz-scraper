import { z } from "zod";

export const dealSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  postedAt: z.coerce.date(),
  scrapedAt: z.coerce.date()
});

export type Deal = z.infer<typeof dealSchema>;

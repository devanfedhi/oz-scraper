export const SCRAPER_CRON_JOB_PRESET_NAME = "scraper";
export const SCRAPER_SERVICE_NAME = "ScraperService";
export const SCRAPER_RUN_HANDLER_NAME = "run";

export type ScraperRunResult = {
  service: typeof SCRAPER_CRON_JOB_PRESET_NAME;
  status: "ok" | "failed";
  sourceUrl: string;
  fetchedCount: number;
  executedAt: string;
};

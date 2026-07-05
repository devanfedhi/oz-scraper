import type { CronJobPresetName, CronJobRequest } from "./cron-job.types.js";

export const CRON_JOB_PRESETS = {
  notifier: {
    cronExpression: "*/5 * * * *",
    service: "NotifierService",
    method: "run"
  },
  scraper: {
    cronExpression: "*/10 * * * *",
    service: "ScraperService",
    method: "run"
  }
} as const satisfies Record<CronJobPresetName, Omit<CronJobRequest, "key" | "payload">>;

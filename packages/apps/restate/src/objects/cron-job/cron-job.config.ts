import type { CronJobPresetName, CronJobRequest } from "./cron-job.types.js";
import {
  NOTIFIER_CRON_JOB_PRESET_NAME,
  NOTIFIER_RUN_HANDLER_NAME,
  NOTIFIER_SERVICE_NAME
} from "../../services/notifier/notifier.types.js";
import {
  SCRAPER_CRON_JOB_PRESET_NAME,
  SCRAPER_RUN_HANDLER_NAME,
  SCRAPER_SERVICE_NAME
} from "../../services/scraper/scraper.types.js";

export const CRON_JOB_PRESETS = {
  [NOTIFIER_CRON_JOB_PRESET_NAME]: {
    cronExpression: "*/5 * * * *",
    service: NOTIFIER_SERVICE_NAME,
    method: NOTIFIER_RUN_HANDLER_NAME
  },
  [SCRAPER_CRON_JOB_PRESET_NAME]: {
    cronExpression: "*/10 * * * *",
    service: SCRAPER_SERVICE_NAME,
    method: SCRAPER_RUN_HANDLER_NAME
  }
} as const satisfies Record<CronJobPresetName, Omit<CronJobRequest, "key" | "payload">>;

export const NOTIFIER_CRON_JOB_PRESET_NAME = "notifier";
export const NOTIFIER_SERVICE_NAME = "NotifierService";
export const NOTIFIER_RUN_HANDLER_NAME = "run";

export type NotifierRunResult = {
  service: typeof NOTIFIER_CRON_JOB_PRESET_NAME;
  status: "ok";
  database: string;
  executedAt: string;
};

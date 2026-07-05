export type CronJobRequest = {
  cronExpression: string;
  service: string;
  method: string;
  key?: string;
  payload?: unknown;
};

export type CronJobPresetName = "notifier" | "scraper";

export type CronJobInfo = {
  request: CronJobRequest;
  nextExecutionTime: string;
  nextExecutionId: string;
};

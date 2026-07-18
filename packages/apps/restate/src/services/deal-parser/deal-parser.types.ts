export const DEAL_PARSER_CRON_JOB_PRESET_NAME = "deal-parser";
export const DEAL_PARSER_SERVICE_NAME = "DealParserService";
export const DEAL_PARSER_RUN_HANDLER_NAME = "run";

export type DealParserRunRequest = {
  externalId: string;
};

export type DealParserRunResult = {
  service: typeof DEAL_PARSER_CRON_JOB_PRESET_NAME;
  status: "ok";
  externalId: string;
  sourceUrl: string;
  executedAt: string;
};

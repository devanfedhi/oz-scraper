import * as restate from "@restatedev/restate-sdk";

import { runDealParser } from "./handlers/run-deal-parser.js";
import { DEAL_PARSER_RUN_HANDLER_NAME, DEAL_PARSER_SERVICE_NAME } from "./deal-parser.types.js";

export const dealParserService = restate.service({
  name: DEAL_PARSER_SERVICE_NAME,
  handlers: {
    [DEAL_PARSER_RUN_HANDLER_NAME]: runDealParser
  }
});

export type DealParserService = typeof dealParserService;

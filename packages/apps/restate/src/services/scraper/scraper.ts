import * as restate from "@restatedev/restate-sdk";

import { runScraper } from "./handlers/run-scraper.js";
import {
  SCRAPER_RUN_HANDLER_NAME,
  SCRAPER_SERVICE_NAME,
  type ScraperRunResult
} from "./scraper.types.js";

export const scraperService = restate.service({
  name: SCRAPER_SERVICE_NAME,
  handlers: {
    [SCRAPER_RUN_HANDLER_NAME]: runScraper
  }
});

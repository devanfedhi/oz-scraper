import * as restate from "@restatedev/restate-sdk";

import { runScraper } from "./handlers/run-scraper.js";
import type { ScraperRunResult } from "./scraper.types.js";

export const scraperService = restate.service({
  name: "ScraperService",
  handlers: {
    run: runScraper
  }
});

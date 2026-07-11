import * as restate from "@restatedev/restate-sdk";

import { cronJob } from "./objects/cron-job/cron-job.js";
import { dealParserService } from "./services/deal-parser/deal-parser.js";
import { notifierService } from "./services/notifier/notifier.js";
import { scraperService } from "./services/scraper/scraper.js";

restate.serve({
  services: [scraperService, notifierService, dealParserService, cronJob]
});

import * as restate from "@restatedev/restate-sdk";

import { cronJob } from "./objects/cron-job/cron-job.js";
import { cronJobInitiator } from "./services/cron-job-initiator/cron-job-initiator.js";
import { notifierService } from "./services/notifier/notifier.js";
import { scraperService } from "./services/scraper/scraper.js";

restate.serve({
  services: [scraperService, notifierService, cronJobInitiator, cronJob]
});

import * as restate from "@restatedev/restate-sdk";

import { createCronJob } from "./handlers/create-cron-job.js";
import { cronJob } from "../../objects/cron-job/cron-job.js";

export const cronJobInitiator = restate.service({
  name: "CronJobInitiator",
  handlers: {
    create: createCronJob
  }
});

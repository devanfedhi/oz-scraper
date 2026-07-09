import * as restate from "@restatedev/restate-sdk";

import { cancelCronJob } from "./handlers/cancel-cron-job.js";
import { createCronJob } from "./handlers/create-cron-job.js";
import { executeCronJob } from "./handlers/execute-cron-job.js";
import { getCronJobInfo } from "./handlers/get-cron-job-info.js";

export const cronJob = restate.object({
  name: "CronJob",
  handlers: {
    create: createCronJob,
    execute: executeCronJob,
    cancel: cancelCronJob,
    getInfo: restate.handlers.object.shared(getCronJobInfo)
  }
});

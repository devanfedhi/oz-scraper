import * as restate from "@restatedev/restate-sdk";

import { cancelCronJob } from "./handlers/cancel-cron-job.js";
import { executeCronJob } from "./handlers/execute-cron-job.js";
import { getCronJobInfo } from "./handlers/get-cron-job-info.js";
import { initiateCronJob } from "./handlers/initiate-cron-job.js";

export const cronJob = restate.object({
  name: "CronJob",
  handlers: {
    initiate: initiateCronJob,
    execute: executeCronJob,
    cancel: cancelCronJob,
    getInfo: restate.handlers.object.shared(getCronJobInfo)
  }
});

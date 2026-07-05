import * as restate from "@restatedev/restate-sdk";

import { runNotifier } from "./handlers/run-notifier.js";
import type { NotifierRunResult } from "./notifier.types.js";

export const notifierService = restate.service({
  name: "NotifierService",
  handlers: {
    run: runNotifier
  }
});

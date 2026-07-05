import * as restate from "@restatedev/restate-sdk";

import { runNotifier } from "./handlers/run-notifier.js";
import {
  NOTIFIER_RUN_HANDLER_NAME,
  NOTIFIER_SERVICE_NAME,
  type NotifierRunResult
} from "./notifier.types.js";

export const notifierService = restate.service({
  name: NOTIFIER_SERVICE_NAME,
  handlers: {
    [NOTIFIER_RUN_HANDLER_NAME]: runNotifier
  }
});

import { OzScraperDbClient } from "@oz-scraper/db";

import type { DatabaseHealthcheckStepResult } from "./database-healthcheck.types.js";

export async function runDatabaseHealthcheckStep(): Promise<DatabaseHealthcheckStepResult> {
  const client = new OzScraperDbClient();

  try {
    return await client.healthcheck();
  } finally {
    await client.close();
  }
}

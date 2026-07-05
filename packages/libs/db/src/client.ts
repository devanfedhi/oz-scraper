import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

export class DatabaseClient {
  readonly db;
  readonly client;

  constructor(databaseUrl: string) {
    this.client = postgres(databaseUrl, { max: 1 });
    this.db = drizzle(this.client, { schema });
  }

  static getRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }

  async healthcheck() {
    const [currentDatabase] = await this.client<{ database: string }[]>`
      SELECT current_database() AS database
    `;

    return {
      status: "ok" as const,
      database: currentDatabase.database
    };
  }

  async close() {
    await this.client.end();
  }
}

export class OzScraperDbClient extends DatabaseClient {
  constructor() {
    super(DatabaseClient.getRequiredEnv("OZ_SCRAPER_DATABASE_URL"));
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const drizzleMock = vi.fn();
const postgresMock = vi.fn();
const endMock = vi.fn();
const sqlTagMock = vi.fn();

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: drizzleMock
}));

vi.mock("postgres", () => ({
  default: postgresMock
}));

describe("DatabaseClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    drizzleMock.mockReturnValue({ query: "db" });
    sqlTagMock.mockResolvedValue([{ database: "oz_scraper" }]);
    endMock.mockResolvedValue(undefined);
    postgresMock.mockReturnValue(
      Object.assign(sqlTagMock, {
        end: endMock
      })
    );
  });

  it("returns required environment variables", async () => {
    process.env.TEST_DATABASE_URL = "postgres://example";
    const { DatabaseClient } = await import("./client.js");

    expect(DatabaseClient.getRequiredEnv("TEST_DATABASE_URL")).toBe("postgres://example");
  });

  it("throws for missing environment variables", async () => {
    delete process.env.MISSING_DATABASE_URL;
    const { DatabaseClient } = await import("./client.js");

    expect(() => DatabaseClient.getRequiredEnv("MISSING_DATABASE_URL")).toThrow(
      "Missing required environment variable: MISSING_DATABASE_URL"
    );
  });

  it("creates a postgres client and reports health", async () => {
    const { DatabaseClient } = await import("./client.js");
    const client = new DatabaseClient("postgres://example");

    const result = await client.healthcheck();

    expect(postgresMock).toHaveBeenCalledWith("postgres://example", { max: 1 });
    expect(drizzleMock).toHaveBeenCalledOnce();
    expect(result).toEqual({
      status: "ok",
      database: "oz_scraper"
    });
  });

  it("closes the postgres client", async () => {
    const { DatabaseClient } = await import("./client.js");
    const client = new DatabaseClient("postgres://example");

    await client.close();

    expect(endMock).toHaveBeenCalledOnce();
  });
});

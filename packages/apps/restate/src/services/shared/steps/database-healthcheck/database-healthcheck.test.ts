import { beforeEach, describe, expect, it, vi } from "vitest";

const closeMock = vi.fn();
const healthcheckMock = vi.fn();
const constructorMock = vi.fn();

vi.mock("@oz-scraper/db", () => ({
  OzScraperDbClient: class {
    constructor() {
      constructorMock();
    }

    close = closeMock;
    healthcheck = healthcheckMock;
  }
}));

describe("runDatabaseHealthcheckStep", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    healthcheckMock.mockResolvedValue({
      status: "ok",
      database: "oz_scraper"
    });
    closeMock.mockResolvedValue(undefined);
  });

  it("returns the database healthcheck result and closes the client", async () => {
    const { runDatabaseHealthcheckStep } = await import("./database-healthcheck.js");

    await expect(runDatabaseHealthcheckStep()).resolves.toEqual({
      status: "ok",
      database: "oz_scraper"
    });
    expect(constructorMock).toHaveBeenCalledOnce();
    expect(healthcheckMock).toHaveBeenCalledOnce();
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("still closes the client when healthcheck fails", async () => {
    const error = new Error("db unavailable");
    healthcheckMock.mockRejectedValueOnce(error);
    const { runDatabaseHealthcheckStep } = await import("./database-healthcheck.js");

    await expect(runDatabaseHealthcheckStep()).rejects.toThrow(error);
    expect(closeMock).toHaveBeenCalledOnce();
  });
});

export type ScraperRunResult = {
  service: "scraper";
  status: "ok";
  runtime: "node";
  database: string;
  executedAt: string;
};

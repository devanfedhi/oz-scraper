import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@oz-scraper/db": resolve(__dirname, "packages/libs/db/src/index.ts"),
      "@oz-scraper/types": resolve(__dirname, "packages/libs/types/src/index.ts")
    }
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"]
  }
});

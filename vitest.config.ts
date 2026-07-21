import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000,
    environmentMatchGlobs: [
      // Tests that touch localStorage run under jsdom.
      ["src/**/*.dom.test.ts", "jsdom"],
    ],
  },
});

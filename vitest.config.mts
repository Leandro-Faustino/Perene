import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve o alias `@/*` do tsconfig sem plugin extra.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve o alias `@/*` do tsconfig sem plugin extra.
    tsconfigPaths: true,
    alias: {
      // `server-only` existe para o bundler barrar import em Client Component.
      // O Vitest roda em Node, que é justamente o ambiente permitido — sem
      // este apelido, todo módulo server-only fica intestável.
      "server-only": new URL("./src/testes/server-only.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

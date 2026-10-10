import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/__tests__/*.test.ts"],
    // Tests import only pure backend functions; no DB/auth/browser setup.
    env: { DATABASE_URL: "", BETTER_AUTH_SECRET: "", BETTER_AUTH_URL: "" },
  },
});

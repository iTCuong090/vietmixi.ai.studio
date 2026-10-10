import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/schema.ts",
  out: "./drizzle",
  schemaFilter: ["vietmixi"],
  migrations: { schema: "vietmixi", table: "__drizzle_migrations" },
  // Generation is offline. Only the explicit migration command uses this URL.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});

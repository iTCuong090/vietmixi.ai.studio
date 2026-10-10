import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "./env";
import * as schema from "./schema";

function createDatabase() {
  const url = getDatabaseUrl();
  const requiresSsl = url.includes("sslmode=require");
  const client = postgres(url, {
    max: 5,
    prepare: false,
    ssl: requiresSsl ? "require" : false,
    connect_timeout: 5,
    idle_timeout: 20,
  });
  return drizzle(client, { schema });
}

type Database = ReturnType<typeof createDatabase>;
const shared = globalThis as typeof globalThis & { vietmixiDatabase?: Database };

// Importing server modules during next build never reads credentials or connects.
export function getDb(): Database {
  return (shared.vietmixiDatabase ??= createDatabase());
}

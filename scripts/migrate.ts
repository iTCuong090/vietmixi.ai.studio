import { config } from "dotenv";
import { readMigrationFiles } from "drizzle-orm/migrator";
import postgres from "postgres";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL chưa được cấu hình.");
  const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" });
  // This is a separate, deliberate release command. Never call it from builds.
  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
    connect_timeout: 10,
  });
  try {
    // Postgres.js pins one connection for the entire transaction. A transaction
    // lock avoids session-pool assumptions and releases on commit or rollback.
    await client.begin(async (tx) => {
      await tx`SET LOCAL lock_timeout = '15s'`;
      await tx`SELECT pg_advisory_xact_lock(hashtext('vietmixi_release_migrations'))`;
      await tx`CREATE SCHEMA IF NOT EXISTS vietmixi`;
      await tx`CREATE TABLE IF NOT EXISTS vietmixi.__drizzle_migrations (
        id serial PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )`;
      const applied = await tx<
        { hash: string; created_at: string }[]
      >`SELECT hash, created_at FROM vietmixi.__drizzle_migrations ORDER BY created_at`;
      for (const row of applied) {
        const source = migrations.find(
          (migration) => migration.folderMillis === Number(row.created_at),
        );
        if (!source || source.hash !== row.hash)
          throw new Error("Migration history does not match the committed SQL files.");
      }
      const latestApplied = Number(applied.at(-1)?.created_at ?? 0);
      for (const migration of migrations) {
        if (applied.some((row) => Number(row.created_at) === migration.folderMillis)) continue;
        if (migration.folderMillis <= latestApplied)
          throw new Error("A migration is missing from the applied history.");
        // Statements come only from versioned migration files in this repository.
        for (const statement of migration.sql) {
          if (statement.trim()) await tx.unsafe(statement);
        }
        await tx`INSERT INTO vietmixi.__drizzle_migrations (hash, created_at) VALUES (${migration.hash}, ${migration.folderMillis})`;
      }
    });
    console.info("Đã áp dụng migration Việt Mixi.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch(() => {
  // Do not print driver errors: they can contain connection strings or SQL data.
  console.error(
    "Migration chưa hoàn tất. Kiểm tra cấu hình server và lịch sử migration; không chạy reset database.",
  );
  process.exitCode = 1;
});

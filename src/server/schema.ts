import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { OutfitConfig } from "@/lib/types";

// All deployments deliberately use this same namespace and the same data.
export const vietmixi = pgSchema("vietmixi");
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const user = vietmixi.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = vietmixi.table(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_idx").on(table.userId)],
);

export const account = vietmixi.table(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("account_user_idx").on(table.userId),
    uniqueIndex("account_provider_idx").on(table.providerId, table.accountId),
  ],
);

export const verification = vietmixi.table(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = vietmixi.table("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const looks = vietmixi.table(
  "looks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    config: jsonb("config").$type<OutfitConfig>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("looks_owner_idx").on(table.ownerId),
    check("looks_revision_positive", sql`${table.revision} > 0`),
  ],
);

export const lookbooks = vietmixi.table(
  "lookbooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    coverLookId: uuid("cover_look_id").references(() => looks.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("lookbooks_owner_idx").on(table.ownerId)],
);

export const lookbookItems = vietmixi.table(
  "lookbook_items",
  {
    lookbookId: uuid("lookbook_id")
      .notNull()
      .references(() => lookbooks.id, { onDelete: "cascade" }),
    lookId: uuid("look_id")
      .notNull()
      .references(() => looks.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.lookbookId, table.lookId] }),
    uniqueIndex("lookbook_position_idx").on(table.lookbookId, table.position),
    index("lookbook_items_look_idx").on(table.lookId),
    check("lookbook_position_nonnegative", sql`${table.position} >= 0`),
  ],
);

// Revoking a share deletes its row. Re-enabling creates a fresh random token.
export const shares = vietmixi.table(
  "shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    lookId: uuid("look_id")
      .unique()
      .references(() => looks.id, { onDelete: "cascade" }),
    lookbookId: uuid("lookbook_id")
      .unique()
      .references(() => lookbooks.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("shares_owner_idx").on(table.ownerId),
    check(
      "share_exactly_one_target",
      sql`(${table.lookId} IS NOT NULL) <> (${table.lookbookId} IS NOT NULL)`,
    ),
  ],
);

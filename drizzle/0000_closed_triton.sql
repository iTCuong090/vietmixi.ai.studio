-- The migrator creates this shared schema for its migration journal first.
CREATE SCHEMA IF NOT EXISTS "vietmixi";
--> statement-breakpoint
CREATE TABLE "vietmixi"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."lookbook_items" (
	"lookbook_id" uuid NOT NULL,
	"look_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "lookbook_items_lookbook_id_look_id_pk" PRIMARY KEY("lookbook_id","look_id"),
	CONSTRAINT "lookbook_position_nonnegative" CHECK ("vietmixi"."lookbook_items"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."lookbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_look_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."looks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"config" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "looks_revision_positive" CHECK ("vietmixi"."looks"."revision" > 0)
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"token" text NOT NULL,
	"look_id" uuid,
	"lookbook_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shares_token_unique" UNIQUE("token"),
	CONSTRAINT "shares_look_id_unique" UNIQUE("look_id"),
	CONSTRAINT "shares_lookbook_id_unique" UNIQUE("lookbook_id"),
	CONSTRAINT "share_exactly_one_target" CHECK (("vietmixi"."shares"."look_id" IS NOT NULL) <> ("vietmixi"."shares"."lookbook_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vietmixi"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vietmixi"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "vietmixi"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."lookbook_items" ADD CONSTRAINT "lookbook_items_lookbook_id_lookbooks_id_fk" FOREIGN KEY ("lookbook_id") REFERENCES "vietmixi"."lookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."lookbook_items" ADD CONSTRAINT "lookbook_items_look_id_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "vietmixi"."looks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."lookbooks" ADD CONSTRAINT "lookbooks_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "vietmixi"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."lookbooks" ADD CONSTRAINT "lookbooks_cover_look_id_looks_id_fk" FOREIGN KEY ("cover_look_id") REFERENCES "vietmixi"."looks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."looks" ADD CONSTRAINT "looks_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "vietmixi"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "vietmixi"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."shares" ADD CONSTRAINT "shares_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "vietmixi"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."shares" ADD CONSTRAINT "shares_look_id_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "vietmixi"."looks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vietmixi"."shares" ADD CONSTRAINT "shares_lookbook_id_lookbooks_id_fk" FOREIGN KEY ("lookbook_id") REFERENCES "vietmixi"."lookbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "vietmixi"."account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_idx" ON "vietmixi"."account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lookbook_position_idx" ON "vietmixi"."lookbook_items" USING btree ("lookbook_id","position");--> statement-breakpoint
CREATE INDEX "lookbook_items_look_idx" ON "vietmixi"."lookbook_items" USING btree ("look_id");--> statement-breakpoint
CREATE INDEX "lookbooks_owner_idx" ON "vietmixi"."lookbooks" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "looks_owner_idx" ON "vietmixi"."looks" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "vietmixi"."session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shares_owner_idx" ON "vietmixi"."shares" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "vietmixi"."verification" USING btree ("identifier");

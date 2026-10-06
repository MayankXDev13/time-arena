CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"email" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"categoryId" uuid,
	"start" bigint NOT NULL,
	"endedAt" bigint,
	"duration" integer NOT NULL,
	"mode" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userSettings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"streakThresholdMinutes" integer DEFAULT 15 NOT NULL,
	"autoStartBreaks" boolean DEFAULT true,
	"soundEnabled" boolean DEFAULT true,
	"defaultTimerMinutes" integer DEFAULT 25,
	"breakDurationMinutes" integer DEFAULT 5,
	"theme" text DEFAULT 'system'
);
--> statement-breakpoint
CREATE INDEX "categories_user_idx" ON "categories" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_uidx" ON "profiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_uidx" ON "userSettings" USING btree ("userId");
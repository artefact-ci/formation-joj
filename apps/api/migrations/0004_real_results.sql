CREATE TABLE "data_extractions" (
	"extracted_on" date PRIMARY KEY NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"source_url" varchar(300) NOT NULL,
	"license" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sport_event_entries" DROP CONSTRAINT "sport_event_entries_rank_or_mention";--> statement-breakpoint
ALTER TABLE "nations" ADD COLUMN "announced_gold" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "nations" ADD COLUMN "announced_silver" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "nations" ADD COLUMN "announced_bronze" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sport_events" ADD COLUMN "has_start_time" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sport_event_entries" ADD CONSTRAINT "sport_event_entries_rank_or_mention" CHECK (("sport_event_entries"."rank" IS NOT NULL AND "sport_event_entries"."mention" IS NULL)
        OR ("sport_event_entries"."rank" IS NULL AND "sport_event_entries"."performance" IS NULL));
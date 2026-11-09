CREATE TABLE "sport_event_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"nation_code" varchar(2) NOT NULL,
	"nation_name" varchar(100) NOT NULL,
	"competitor" varchar(150) NOT NULL,
	"rank" integer,
	"performance" varchar(50),
	"mention" varchar(20),
	CONSTRAINT "sport_event_entries_rank_or_mention" CHECK (("sport_event_entries"."rank" IS NOT NULL AND "sport_event_entries"."performance" IS NOT NULL AND "sport_event_entries"."mention" IS NULL)
        OR ("sport_event_entries"."rank" IS NULL AND "sport_event_entries"."performance" IS NULL AND "sport_event_entries"."mention" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "sport_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sport" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"status" varchar(20) NOT NULL,
	"starts_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sport_event_entries" ADD CONSTRAINT "sport_event_entries_event_id_sport_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."sport_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sport_event_entries_competitor_key" ON "sport_event_entries" USING btree ("event_id","competitor");--> statement-breakpoint
CREATE UNIQUE INDEX "sport_events_identity_key" ON "sport_events" USING btree ("sport","name","starts_at");
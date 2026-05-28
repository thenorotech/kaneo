ALTER TABLE "sprint" RENAME COLUMN "goal" TO "review_notes";--> statement-breakpoint
ALTER TABLE "sprint" RENAME COLUMN "start_date" TO "review_date";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_sprint_id_sprint_id_fk";
--> statement-breakpoint
ALTER TABLE "sprint" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "task" DROP COLUMN "sprint_id";
ALTER TABLE "esj_task_link" ADD COLUMN "stage" text;--> statement-breakpoint
CREATE INDEX "esj_task_link_stage_idx" ON "esj_task_link" USING btree ("stage");

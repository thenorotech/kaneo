CREATE TABLE "charter_event" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charter_version" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"charter_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"reason" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "charter_version_project_number_unique" UNIQUE("project_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "project_charter" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"project_name" text,
	"project_type" text,
	"responsible_area" text,
	"project_manager" text,
	"elaboration_date" timestamp,
	"objective" text,
	"high_level_description" text,
	"scope" text,
	"key_deliverables" text,
	"high_level_requirements" text,
	"assumptions_restrictions" text,
	"overall_risk" text,
	"success_criteria" text,
	"kpis" text,
	"tracking_control_mechanism" text,
	"necessary_resources" text,
	"preliminary_budget" text,
	"critical_factors" text,
	"key_collaborators" jsonb,
	"preliminary_schedule" jsonb,
	"communication_plan" jsonb,
	"related_projects" jsonb,
	"pm_approved_by" text,
	"pm_approved_at" timestamp,
	"leader_approved_by" text,
	"leader_approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_charter_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "sprint" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "charter_status" text DEFAULT 'pending_charter' NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "sprint_id" text;--> statement-breakpoint
ALTER TABLE "time_entry" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "charter_event" ADD CONSTRAINT "charter_event_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charter_event" ADD CONSTRAINT "charter_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charter_version" ADD CONSTRAINT "charter_version_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charter_version" ADD CONSTRAINT "charter_version_charter_id_project_charter_id_fk" FOREIGN KEY ("charter_id") REFERENCES "public"."project_charter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charter_version" ADD CONSTRAINT "charter_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_charter" ADD CONSTRAINT "project_charter_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_charter" ADD CONSTRAINT "project_charter_pm_approved_by_user_id_fk" FOREIGN KEY ("pm_approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_charter" ADD CONSTRAINT "project_charter_leader_approved_by_user_id_fk" FOREIGN KEY ("leader_approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint" ADD CONSTRAINT "sprint_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "charter_event_projectId_idx" ON "charter_event" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "charter_version_projectId_idx" ON "charter_version" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_charter_projectId_idx" ON "project_charter" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sprint_projectId_idx" ON "sprint" USING btree ("project_id");--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_sprint_id_sprint_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprint"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "activity_userId_idx" ON "activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_createdBy_idx" ON "asset" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "invitation_inviterId_idx" ON "invitation" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_assigneeId_idx" ON "task" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "task_columnId_idx" ON "task" USING btree ("column_id");--> statement-breakpoint
CREATE INDEX "time_entry_taskId_idx" ON "time_entry" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "time_entry_userId_idx" ON "time_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notification_workspace_project_workspaceId_projectId_idx" ON "user_notification_workspace_project" USING btree ("workspace_id","project_id");--> statement-breakpoint
CREATE INDEX "unwp_workspaceId_workspaceRuleId_idx" ON "user_notification_workspace_project" USING btree ("workspace_id","workspace_rule_id");--> statement-breakpoint
CREATE INDEX "workflow_rule_columnId_idx" ON "workflow_rule" USING btree ("column_id");
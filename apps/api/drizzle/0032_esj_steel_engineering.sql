CREATE TABLE "esj_project" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"sap_code" text NOT NULL,
	"name" text NOT NULL,
	"client_name" text NOT NULL,
	"requester" text,
	"required_date" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"design_type" text,
	"design_origin" text DEFAULT 'esj' NOT NULL,
	"total_tonnage" numeric(12, 2) DEFAULT '0' NOT NULL,
	"connection_date" timestamp,
	"submittal_date" timestamp,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"source" text DEFAULT 'sap-email' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "esj_project_project_id_unique" UNIQUE("project_id"),
	CONSTRAINT "esj_project_sap_code_unique" UNIQUE("sap_code")
);
--> statement-breakpoint
CREATE TABLE "esj_area" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"esj_project_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"tonnage" numeric(12, 2) DEFAULT '0' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "esj_area_esjProject_name_unique" UNIQUE("esj_project_id","name")
);
--> statement-breakpoint
CREATE TABLE "esj_phase" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"esj_project_id" text NOT NULL,
	"area_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "esj_piece" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"esj_project_id" text NOT NULL,
	"phase_id" text,
	"area_id" text,
	"code" text NOT NULL,
	"description" text,
	"piece_type" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"weight" numeric(12, 3),
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "esj_task_link" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"project_id" text NOT NULL,
	"esj_project_id" text NOT NULL,
	"phase_id" text,
	"area_id" text,
	"piece_id" text,
	"role_key" text,
	"activity_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "esj_task_link_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "esj_role_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "esj_role_assignment_workspace_user_role_unique" UNIQUE("workspace_id","user_id","role_key")
);
--> statement-breakpoint
CREATE TABLE "esj_sap_intake" (
	"id" text PRIMARY KEY NOT NULL,
	"sap_code" text NOT NULL,
	"workspace_id" text,
	"raw_payload" text NOT NULL,
	"parsed_data" jsonb,
	"status" text DEFAULT 'received' NOT NULL,
	"error" text,
	"project_id" text,
	"esj_project_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "esj_sap_intake_sap_code_unique" UNIQUE("sap_code")
);
--> statement-breakpoint
ALTER TABLE "esj_project" ADD CONSTRAINT "esj_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_project" ADD CONSTRAINT "esj_project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_area" ADD CONSTRAINT "esj_area_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_area" ADD CONSTRAINT "esj_area_esj_project_id_esj_project_id_fk" FOREIGN KEY ("esj_project_id") REFERENCES "public"."esj_project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_phase" ADD CONSTRAINT "esj_phase_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_phase" ADD CONSTRAINT "esj_phase_esj_project_id_esj_project_id_fk" FOREIGN KEY ("esj_project_id") REFERENCES "public"."esj_project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_phase" ADD CONSTRAINT "esj_phase_area_id_esj_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."esj_area"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_piece" ADD CONSTRAINT "esj_piece_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_piece" ADD CONSTRAINT "esj_piece_esj_project_id_esj_project_id_fk" FOREIGN KEY ("esj_project_id") REFERENCES "public"."esj_project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_piece" ADD CONSTRAINT "esj_piece_phase_id_esj_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."esj_phase"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_piece" ADD CONSTRAINT "esj_piece_area_id_esj_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."esj_area"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_esj_project_id_esj_project_id_fk" FOREIGN KEY ("esj_project_id") REFERENCES "public"."esj_project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_phase_id_esj_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."esj_phase"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_area_id_esj_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."esj_area"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_task_link" ADD CONSTRAINT "esj_task_link_piece_id_esj_piece_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."esj_piece"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_role_assignment" ADD CONSTRAINT "esj_role_assignment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_role_assignment" ADD CONSTRAINT "esj_role_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_sap_intake" ADD CONSTRAINT "esj_sap_intake_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_sap_intake" ADD CONSTRAINT "esj_sap_intake_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "esj_sap_intake" ADD CONSTRAINT "esj_sap_intake_esj_project_id_esj_project_id_fk" FOREIGN KEY ("esj_project_id") REFERENCES "public"."esj_project"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "esj_project_workspaceId_idx" ON "esj_project" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "esj_project_status_idx" ON "esj_project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "esj_project_designType_idx" ON "esj_project" USING btree ("design_type");--> statement-breakpoint
CREATE INDEX "esj_area_projectId_idx" ON "esj_area" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "esj_area_esjProjectId_idx" ON "esj_area" USING btree ("esj_project_id");--> statement-breakpoint
CREATE INDEX "esj_phase_projectId_idx" ON "esj_phase" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "esj_phase_esjProjectId_idx" ON "esj_phase" USING btree ("esj_project_id");--> statement-breakpoint
CREATE INDEX "esj_phase_areaId_idx" ON "esj_phase" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "esj_phase_status_idx" ON "esj_phase" USING btree ("status");--> statement-breakpoint
CREATE INDEX "esj_piece_projectId_idx" ON "esj_piece" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "esj_piece_esjProjectId_idx" ON "esj_piece" USING btree ("esj_project_id");--> statement-breakpoint
CREATE INDEX "esj_piece_phaseId_idx" ON "esj_piece" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "esj_piece_areaId_idx" ON "esj_piece" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "esj_task_link_esjProjectId_idx" ON "esj_task_link" USING btree ("esj_project_id");--> statement-breakpoint
CREATE INDEX "esj_task_link_phaseId_idx" ON "esj_task_link" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "esj_task_link_areaId_idx" ON "esj_task_link" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "esj_task_link_pieceId_idx" ON "esj_task_link" USING btree ("piece_id");--> statement-breakpoint
CREATE INDEX "esj_task_link_roleKey_idx" ON "esj_task_link" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "esj_role_assignment_workspaceId_idx" ON "esj_role_assignment" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "esj_role_assignment_userId_idx" ON "esj_role_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "esj_role_assignment_roleKey_idx" ON "esj_role_assignment" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "esj_sap_intake_workspaceId_idx" ON "esj_sap_intake" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "esj_sap_intake_status_idx" ON "esj_sap_intake" USING btree ("status");

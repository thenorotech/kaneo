import { sql } from "drizzle-orm";
import db from "../database";

/**
 * Repairs MACOM Charter tables for instances where migration state drift left
 * the schema partially applied.
 */
export async function migrateMacomCharterSchema() {
  console.log("Checking MACOM Charter schema...");

  try {
    await db.execute(sql`
      ALTER TABLE "project"
      ADD COLUMN IF NOT EXISTS "charter_status" text DEFAULT 'pending_charter' NOT NULL;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "project_charter" (
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
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE "project_charter"
      ADD COLUMN IF NOT EXISTS "id" text,
      ADD COLUMN IF NOT EXISTS "project_id" text,
      ADD COLUMN IF NOT EXISTS "project_name" text,
      ADD COLUMN IF NOT EXISTS "project_type" text,
      ADD COLUMN IF NOT EXISTS "responsible_area" text,
      ADD COLUMN IF NOT EXISTS "project_manager" text,
      ADD COLUMN IF NOT EXISTS "elaboration_date" timestamp,
      ADD COLUMN IF NOT EXISTS "objective" text,
      ADD COLUMN IF NOT EXISTS "high_level_description" text,
      ADD COLUMN IF NOT EXISTS "scope" text,
      ADD COLUMN IF NOT EXISTS "key_deliverables" text,
      ADD COLUMN IF NOT EXISTS "high_level_requirements" text,
      ADD COLUMN IF NOT EXISTS "assumptions_restrictions" text,
      ADD COLUMN IF NOT EXISTS "overall_risk" text,
      ADD COLUMN IF NOT EXISTS "success_criteria" text,
      ADD COLUMN IF NOT EXISTS "kpis" text,
      ADD COLUMN IF NOT EXISTS "tracking_control_mechanism" text,
      ADD COLUMN IF NOT EXISTS "necessary_resources" text,
      ADD COLUMN IF NOT EXISTS "preliminary_budget" text,
      ADD COLUMN IF NOT EXISTS "critical_factors" text,
      ADD COLUMN IF NOT EXISTS "key_collaborators" jsonb,
      ADD COLUMN IF NOT EXISTS "preliminary_schedule" jsonb,
      ADD COLUMN IF NOT EXISTS "communication_plan" jsonb,
      ADD COLUMN IF NOT EXISTS "related_projects" jsonb,
      ADD COLUMN IF NOT EXISTS "pm_approved_by" text,
      ADD COLUMN IF NOT EXISTS "pm_approved_at" timestamp,
      ADD COLUMN IF NOT EXISTS "leader_approved_by" text,
      ADD COLUMN IF NOT EXISTS "leader_approved_at" timestamp,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "charter_event" (
        "id" text PRIMARY KEY NOT NULL,
        "project_id" text NOT NULL,
        "actor_user_id" text,
        "action" text NOT NULL,
        "comment" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE "charter_event"
      ADD COLUMN IF NOT EXISTS "id" text,
      ADD COLUMN IF NOT EXISTS "project_id" text,
      ADD COLUMN IF NOT EXISTS "actor_user_id" text,
      ADD COLUMN IF NOT EXISTS "action" text,
      ADD COLUMN IF NOT EXISTS "comment" text,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "charter_version" (
        "id" text PRIMARY KEY NOT NULL,
        "project_id" text NOT NULL,
        "charter_id" text NOT NULL,
        "version_number" integer NOT NULL,
        "snapshot" jsonb NOT NULL,
        "reason" text,
        "created_by" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE "charter_version"
      ADD COLUMN IF NOT EXISTS "id" text,
      ADD COLUMN IF NOT EXISTS "project_id" text,
      ADD COLUMN IF NOT EXISTS "charter_id" text,
      ADD COLUMN IF NOT EXISTS "version_number" integer,
      ADD COLUMN IF NOT EXISTS "snapshot" jsonb,
      ADD COLUMN IF NOT EXISTS "reason" text,
      ADD COLUMN IF NOT EXISTS "created_by" text,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "project_charter_project_id_unique"
      ON "project_charter" ("project_id");
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "charter_version_project_number_unique"
      ON "charter_version" ("project_id", "version_number");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "project_charter_projectId_idx"
      ON "project_charter" ("project_id");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "charter_event_projectId_idx"
      ON "charter_event" ("project_id");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "charter_version_projectId_idx"
      ON "charter_version" ("project_id");
    `);

    await db.execute(sql`
      UPDATE "project_charter"
      SET "id" = 'pc_' || md5(random()::text || clock_timestamp()::text)
      WHERE "id" IS NULL;
    `);
    await db.execute(sql`
      UPDATE "charter_event"
      SET "id" = 'ce_' || md5(random()::text || clock_timestamp()::text)
      WHERE "id" IS NULL;
    `);
    await db.execute(sql`
      UPDATE "charter_version"
      SET "id" = 'cv_' || md5(random()::text || clock_timestamp()::text)
      WHERE "id" IS NULL;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'project_charter'::regclass
          AND contype = 'p'
        ) THEN
          ALTER TABLE "project_charter"
          ADD CONSTRAINT "project_charter_id_pk" PRIMARY KEY ("id");
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'charter_event'::regclass
          AND contype = 'p'
        ) THEN
          ALTER TABLE "charter_event"
          ADD CONSTRAINT "charter_event_id_pk" PRIMARY KEY ("id");
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'charter_version'::regclass
          AND contype = 'p'
        ) THEN
          ALTER TABLE "charter_version"
          ADD CONSTRAINT "charter_version_id_pk" PRIMARY KEY ("id");
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'project_charter_project_id_project_id_fk'
        ) THEN
          ALTER TABLE "project_charter"
          ADD CONSTRAINT "project_charter_project_id_project_id_fk"
          FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
          ON DELETE cascade;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'project_charter_pm_approved_by_user_id_fk'
        ) THEN
          ALTER TABLE "project_charter"
          ADD CONSTRAINT "project_charter_pm_approved_by_user_id_fk"
          FOREIGN KEY ("pm_approved_by") REFERENCES "public"."user"("id")
          ON DELETE set null;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'project_charter_leader_approved_by_user_id_fk'
        ) THEN
          ALTER TABLE "project_charter"
          ADD CONSTRAINT "project_charter_leader_approved_by_user_id_fk"
          FOREIGN KEY ("leader_approved_by") REFERENCES "public"."user"("id")
          ON DELETE set null;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'charter_event_project_id_project_id_fk'
        ) THEN
          ALTER TABLE "charter_event"
          ADD CONSTRAINT "charter_event_project_id_project_id_fk"
          FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
          ON DELETE cascade;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'charter_event_actor_user_id_user_id_fk'
        ) THEN
          ALTER TABLE "charter_event"
          ADD CONSTRAINT "charter_event_actor_user_id_user_id_fk"
          FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id")
          ON DELETE set null;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'charter_version_project_id_project_id_fk'
        ) THEN
          ALTER TABLE "charter_version"
          ADD CONSTRAINT "charter_version_project_id_project_id_fk"
          FOREIGN KEY ("project_id") REFERENCES "public"."project"("id")
          ON DELETE cascade;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'charter_version_charter_id_project_charter_id_fk'
        ) THEN
          ALTER TABLE "charter_version"
          ADD CONSTRAINT "charter_version_charter_id_project_charter_id_fk"
          FOREIGN KEY ("charter_id") REFERENCES "public"."project_charter"("id")
          ON DELETE cascade;
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'charter_version_created_by_user_id_fk'
        ) THEN
          ALTER TABLE "charter_version"
          ADD CONSTRAINT "charter_version_created_by_user_id_fk"
          FOREIGN KEY ("created_by") REFERENCES "public"."user"("id")
          ON DELETE set null;
        END IF;
      END $$;
    `);

    console.log("MACOM Charter schema check complete!");
  } catch (error) {
    console.error("Error during MACOM Charter schema migration:", error);
    throw error;
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const execute = vi.fn();

function stringifySql(query: unknown) {
  const chunks = (query as { queryChunks?: Array<{ value?: string[] }> })
    .queryChunks;

  return chunks?.flatMap((chunk) => chunk.value ?? []).join("") ?? "";
}

vi.mock("../../../apps/api/src/database", () => ({
  default: { execute },
}));

describe("migrateMacomCharterSchema", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("repairs missing charter tables and columns for partially migrated databases", async () => {
    const { migrateMacomCharterSchema } = await import(
      "../../../apps/api/src/utils/migrate-macom-charter-schema"
    );

    await migrateMacomCharterSchema();

    const sqlText = execute.mock.calls
      .map(([query]) => stringifySql(query))
      .join("\n");

    expect(sqlText).toContain('CREATE TABLE IF NOT EXISTS "project_charter"');
    expect(sqlText).toContain('ALTER TABLE "project_charter"');
    expect(sqlText).toContain('ADD COLUMN IF NOT EXISTS "id" text');
    expect(sqlText).toContain('ADD COLUMN IF NOT EXISTS "elaboration_date"');
    expect(sqlText).toContain('CREATE TABLE IF NOT EXISTS "charter_event"');
    expect(sqlText).toContain('CREATE TABLE IF NOT EXISTS "charter_version"');
    expect(sqlText).toContain('ADD COLUMN IF NOT EXISTS "charter_status"');
    expect(sqlText).toContain("project_charter_id_pk");
    expect(sqlText).toContain("charter_event_id_pk");
    expect(sqlText).toContain("charter_version_id_pk");
    expect(sqlText).toContain("charter_event_actor_user_id_user_id_fk");
    expect(sqlText).toContain("charter_version_project_id_project_id_fk");
    expect(sqlText).toContain("charter_version_created_by_user_id_fk");
  });
});

import { eq } from "drizzle-orm";
import db from "../../database";
import { projectCharterTable, projectTable } from "../../database/schema";

export async function getCharter(projectId: string) {
  const project = await db.query.projectTable.findFirst({
    where: eq(projectTable.id, projectId),
  });
  if (!project) throw new Error("Project not found");

  const charter = await db.query.projectCharterTable.findFirst({
    where: eq(projectCharterTable.projectId, projectId),
  });

  return {
    charterStatus: project.charterStatus,
    charter: charter || null,
  };
}

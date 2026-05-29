import { asc, eq } from "drizzle-orm";
import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function listSprints(projectId: string) {
  const sprints = await db.query.sprintTable.findMany({
    where: eq(sprintTable.projectId, projectId),
    orderBy: [asc(sprintTable.reviewDate)],
  });
  return sprints;
}

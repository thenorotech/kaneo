import { desc, eq } from "drizzle-orm";
import db from "../../database";
import { charterVersionTable } from "../../database/schema";

export async function getVersions(projectId: string) {
  const versions = await db.query.charterVersionTable.findMany({
    where: eq(charterVersionTable.projectId, projectId),
    orderBy: [desc(charterVersionTable.versionNumber)],
    limit: 10,
  });
  return versions;
}

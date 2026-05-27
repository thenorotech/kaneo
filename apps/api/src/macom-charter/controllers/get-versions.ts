import { desc, eq } from "drizzle-orm";
import db from "../../database";
import { charterVersionTable, charterEventTable } from "../../database/schema";

export async function getVersions(projectId: string) {
  const versions = await db.query.charterVersionTable.findMany({
    where: eq(charterVersionTable.projectId, projectId),
    orderBy: [desc(charterVersionTable.versionNumber)],
    limit: 10,
  });
  return versions;
}

export async function getEvents(projectId: string) {
  const events = await db.query.charterEventTable.findMany({
    where: eq(charterEventTable.projectId, projectId),
    orderBy: [desc(charterEventTable.createdAt)],
    with: {
      actorUserId: true, // We'll need a relation to user table for this in drizzle, but it might not be defined. Let's return raw for now.
    },
  });
  return events;
}

import { desc, eq } from "drizzle-orm";
import db from "../../database";
import { charterEventTable } from "../../database/schema";

export async function getEvents(projectId: string) {
  const events = await db.query.charterEventTable.findMany({
    where: eq(charterEventTable.projectId, projectId),
    orderBy: [desc(charterEventTable.createdAt)],
  });
  return events;
}

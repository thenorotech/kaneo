import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function createSprint(data: {
  projectId: string;
  name: string;
  reviewNotes?: string;
  reviewDate?: string;
}) {
  const [sprint] = await db
    .insert(sprintTable)
    .values({
      projectId: data.projectId,
      name: data.name,
      reviewNotes: data.reviewNotes,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      status: "planned",
    })
    .returning();

  return sprint;
}

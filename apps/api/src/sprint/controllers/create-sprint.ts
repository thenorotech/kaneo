import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function createSprint(data: {
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [sprint] = await db
    .insert(sprintTable)
    .values({
      projectId: data.projectId,
      name: data.name,
      goal: data.goal,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: "planned",
    })
    .returning();

  return sprint;
}

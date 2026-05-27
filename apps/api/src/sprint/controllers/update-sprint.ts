import { eq } from "drizzle-orm";
import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function updateSprint(id: string, data: {
  name?: string;
  goal?: string;
  status?: "planned" | "active" | "completed";
  startDate?: string;
  endDate?: string;
}) {
  const [sprint] = await db
    .update(sprintTable)
    .set({
      name: data.name,
      goal: data.goal,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(sprintTable.id, id))
    .returning();

  if (!sprint) throw new Error("Sprint not found");
  return sprint;
}

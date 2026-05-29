import { eq } from "drizzle-orm";
import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function updateSprint(
  id: string,
  data: {
    name?: string;
    reviewNotes?: string;
    status?: "planned" | "active" | "completed";
    reviewDate?: string;
  },
) {
  const [sprint] = await db
    .update(sprintTable)
    .set({
      name: data.name,
      reviewNotes: data.reviewNotes,
      status: data.status,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(sprintTable.id, id))
    .returning();

  if (!sprint) throw new Error("Sprint not found");
  return sprint;
}

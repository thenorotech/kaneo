import { eq } from "drizzle-orm";
import db from "../../database";
import { sprintTable } from "../../database/schema";

export async function deleteSprint(id: string) {
  const [deleted] = await db
    .delete(sprintTable)
    .where(eq(sprintTable.id, id))
    .returning({ id: sprintTable.id });

  if (!deleted) throw new Error("Sprint not found");
  return { success: true };
}

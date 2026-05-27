import { eq } from "drizzle-orm";
import db from "../../database";
import { projectTable, charterEventTable } from "../../database/schema";

export async function submitCharter(projectId: string, userId: string) {
  return db.transaction(async (tx) => {
    const project = await tx.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
    });

    if (!project) throw new Error("Project not found");
    if (project.charterStatus !== "pending_charter") {
      throw new Error("Charter is already submitted or approved");
    }

    await tx
      .update(projectTable)
      .set({ charterStatus: "pending_approval" })
      .where(eq(projectTable.id, projectId));

    await tx.insert(charterEventTable).values({
      projectId,
      actorUserId: userId,
      action: "submitted_for_review",
      comment: "Submitted for approval",
    });

    return { success: true, status: "pending_approval" };
  });
}

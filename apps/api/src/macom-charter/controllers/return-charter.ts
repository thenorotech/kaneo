import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  charterEventTable,
  projectCharterTable,
  projectTable,
} from "../../database/schema";

export async function returnCharter(
  projectId: string,
  userId: string,
  comment: string,
) {
  return db.transaction(async (tx) => {
    const project = await tx.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
    });

    if (!project || project.charterStatus !== "pending_approval") {
      throw new HTTPException(400, {
        message: "Project not in pending_approval status",
      });
    }

    await tx
      .update(projectTable)
      .set({ charterStatus: "pending_charter" })
      .where(eq(projectTable.id, projectId));

    // Clear previous approvals
    await tx
      .update(projectCharterTable)
      .set({
        pmApprovedBy: null,
        pmApprovedAt: null,
        leaderApprovedBy: null,
        leaderApprovedAt: null,
      })
      .where(eq(projectCharterTable.projectId, projectId));

    await tx.insert(charterEventTable).values({
      projectId,
      actorUserId: userId,
      action: "returned_with_observations",
      comment,
    });

    return { success: true, status: "pending_charter" };
  });
}

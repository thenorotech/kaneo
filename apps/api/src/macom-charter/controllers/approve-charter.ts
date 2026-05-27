import { eq } from "drizzle-orm";
import db from "../../database";
import { projectTable, projectCharterTable, charterEventTable } from "../../database/schema";

export async function approveCharter(projectId: string, userId: string, role: "pm" | "leader") {
  return db.transaction(async (tx) => {
    const project = await tx.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
    });

    if (!project || project.charterStatus !== "pending_approval") {
      throw new Error("Project not in pending_approval status");
    }

    const charter = await tx.query.projectCharterTable.findFirst({
      where: eq(projectCharterTable.projectId, projectId),
    });

    if (!charter) throw new Error("Charter not found");

    const updateData: any = {};
    if (role === "pm") {
      updateData.pmApprovedBy = userId;
      updateData.pmApprovedAt = new Date();
    } else {
      updateData.leaderApprovedBy = userId;
      updateData.leaderApprovedAt = new Date();
    }

    await tx
      .update(projectCharterTable)
      .set(updateData)
      .where(eq(projectCharterTable.projectId, projectId));

    await tx.insert(charterEventTable).values({
      projectId,
      actorUserId: userId,
      action: `${role}_approved`,
      comment: `Approved by ${role.toUpperCase()}`,
    });

    // Check if both approved
    const isPmApproved = role === "pm" || !!charter.pmApprovedBy;
    const isLeaderApproved = role === "leader" || !!charter.leaderApprovedBy;

    if (isPmApproved && isLeaderApproved) {
      await tx
        .update(projectTable)
        .set({ charterStatus: "approved" })
        .where(eq(projectTable.id, projectId));

      await tx.insert(charterEventTable).values({
        projectId,
        actorUserId: userId,
        action: "approved",
        comment: "Final approval granted",
      });

      return { success: true, status: "approved" };
    }

    return { success: true, status: "pending_approval" };
  });
}

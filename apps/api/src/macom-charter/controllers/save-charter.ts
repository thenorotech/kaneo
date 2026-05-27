import { eq } from "drizzle-orm";
import db from "../../database";
import { projectCharterTable, charterEventTable, charterVersionTable } from "../../database/schema";

export async function saveCharter(projectId: string, userId: string, data: any) {
  return db.transaction(async (tx) => {
    // 1. Check existing
    const existing = await tx.query.projectCharterTable.findFirst({
      where: eq(projectCharterTable.projectId, projectId),
    });
    
    let charterId;
    let finalData;

    // Filter data to only valid columns
    const { 
      projectName, projectType, responsibleArea, projectManager,
      objective, highLevelDescription, scope, keyDeliverables,
      highLevelRequirements, assumptionsRestrictions, overallRisk,
      successCriteria, kpis, trackingControlMechanism, necessaryResources,
      preliminaryBudget, criticalFactors, keyCollaborators,
      preliminarySchedule, communicationPlan, relatedProjects,
      elaborationDate
    } = data;

    const payload = {
      projectName, projectType, responsibleArea, projectManager,
      objective, highLevelDescription, scope, keyDeliverables,
      highLevelRequirements, assumptionsRestrictions, overallRisk,
      successCriteria, kpis, trackingControlMechanism, necessaryResources,
      preliminaryBudget, criticalFactors, keyCollaborators,
      preliminarySchedule, communicationPlan, relatedProjects,
      elaborationDate: elaborationDate ? new Date(elaborationDate) : undefined,
    };

    if (existing) {
      const [updated] = await tx
        .update(projectCharterTable)
        .set({ ...payload, updatedAt: new Date() })
        .where(eq(projectCharterTable.projectId, projectId))
        .returning();
      charterId = updated.id;
      finalData = updated;
    } else {
      const [inserted] = await tx
        .insert(projectCharterTable)
        .values({ ...payload, projectId })
        .returning();
      charterId = inserted.id;
      finalData = inserted;
    }

    // 2. Save event
    await tx.insert(charterEventTable).values({
      projectId,
      actorUserId: userId,
      action: "draft_saved",
      comment: "Charter draft saved",
    });

    // 3. Save version
    const versions = await tx.query.charterVersionTable.findMany({
      where: eq(charterVersionTable.projectId, projectId),
      orderBy: (versions, { desc }) => [desc(versions.versionNumber)],
      limit: 1,
    });
    const nextVersion = (versions[0]?.versionNumber || 0) + 1;

    await tx.insert(charterVersionTable).values({
      projectId,
      charterId,
      versionNumber: nextVersion,
      snapshot: finalData,
      reason: "draft_saved",
      createdBy: userId,
    });

    return { success: true, charterId, charter: finalData };
  });
}

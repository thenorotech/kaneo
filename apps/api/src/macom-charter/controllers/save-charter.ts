import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  charterEventTable,
  charterVersionTable,
  projectCharterTable,
} from "../../database/schema";

export function normalizeCharterDate(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new HTTPException(400, { message: "Invalid elaboration date" });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HTTPException(400, { message: "Invalid elaboration date" });
  }

  return date;
}

export async function saveCharter(
  projectId: string,
  userId: string,
  data: Record<string, unknown>,
) {
  return db.transaction(async (tx) => {
    // 1. Check existing
    const existing = await tx.query.projectCharterTable.findFirst({
      where: eq(projectCharterTable.projectId, projectId),
    });

    let charterId: string | undefined;
    let finalData: Record<string, unknown>;

    // Filter data to only valid columns
    const {
      projectName,
      projectType,
      responsibleArea,
      projectManager,
      objective,
      highLevelDescription,
      scope,
      keyDeliverables,
      highLevelRequirements,
      assumptionsRestrictions,
      overallRisk,
      successCriteria,
      kpis,
      trackingControlMechanism,
      necessaryResources,
      preliminaryBudget,
      criticalFactors,
      keyCollaborators,
      preliminarySchedule,
      communicationPlan,
      relatedProjects,
      elaborationDate,
    } = data;

    const payload = {
      projectName,
      projectType,
      responsibleArea,
      projectManager,
      objective,
      highLevelDescription,
      scope,
      keyDeliverables,
      highLevelRequirements,
      assumptionsRestrictions,
      overallRisk,
      successCriteria,
      kpis,
      trackingControlMechanism,
      necessaryResources,
      preliminaryBudget,
      criticalFactors,
      keyCollaborators,
      preliminarySchedule,
      communicationPlan,
      relatedProjects,
      elaborationDate: normalizeCharterDate(elaborationDate),
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

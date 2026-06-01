import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { esjPhaseTable } from "../../database/schema";
import { publishEvent } from "../../events";

/**
 * Actualiza el estado de una fase y marca marcas de tiempo de inicio/fin,
 * que sirven para la medición del avance del proyecto.
 */
async function updatePhaseStatus({
  phaseId,
  status,
  currentUserId,
}: {
  phaseId: string;
  status: string;
  currentUserId: string;
}) {
  const [phase] = await db
    .select()
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.id, phaseId))
    .limit(1);

  if (!phase) {
    throw new HTTPException(404, { message: "Fase no encontrada." });
  }

  const patch: Partial<typeof esjPhaseTable.$inferInsert> = { status };
  if (status === "in-progress" && !phase.startedAt) {
    patch.startedAt = new Date();
  }
  if (status === "done") {
    patch.completedAt = new Date();
  }

  const [updated] = await db
    .update(esjPhaseTable)
    .set(patch)
    .where(eq(esjPhaseTable.id, phaseId))
    .returning();

  if (!updated) {
    throw new HTTPException(500, {
      message: "No se pudo actualizar la fase.",
    });
  }

  await publishEvent("esj.phase.status_changed", {
    phaseId,
    esjProjectId: phase.esjProjectId,
    projectId: phase.projectId,
    oldStatus: phase.status,
    newStatus: status,
    currentUserId,
    type: "status_changed",
  });

  return updated;
}

export default updatePhaseStatus;

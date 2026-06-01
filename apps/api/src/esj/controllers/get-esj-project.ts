import { asc, eq, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  esjAreaTable,
  esjPhaseTable,
  esjPieceTable,
  esjProjectTable,
  esjTaskLinkTable,
  taskTable,
  timeEntryTable,
} from "../../database/schema";

/**
 * Vista general de un proyecto ESJ a partir del id del proyecto kaneo:
 * metadata SAP, áreas, fases (con tiempo registrado) y piezas.
 */
async function getEsjProject(projectId: string) {
  const [esjProject] = await db
    .select()
    .from(esjProjectTable)
    .where(eq(esjProjectTable.projectId, projectId))
    .limit(1);

  if (!esjProject) {
    throw new HTTPException(404, {
      message: "Proyecto ESJ no encontrado para ese proyecto.",
    });
  }

  const areas = await db
    .select()
    .from(esjAreaTable)
    .where(eq(esjAreaTable.esjProjectId, esjProject.id))
    .orderBy(asc(esjAreaTable.position));

  const phases = await db
    .select()
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.esjProjectId, esjProject.id))
    .orderBy(asc(esjPhaseTable.sequence));

  const pieces = await db
    .select()
    .from(esjPieceTable)
    .where(eq(esjPieceTable.esjProjectId, esjProject.id))
    .orderBy(asc(esjPieceTable.code));

  // Segundos registrados por fase (vía task -> time_entry).
  const phaseIds = phases.map((p) => p.id);
  const secondsByPhase = new Map<string, number>();
  const ticketsByPhase = new Map<string, number>();
  if (phaseIds.length > 0) {
    const rows = await db
      .select({
        phaseId: esjTaskLinkTable.phaseId,
        seconds: sql<number>`coalesce(sum(${timeEntryTable.duration}), 0)::int`,
      })
      .from(esjTaskLinkTable)
      .innerJoin(taskTable, eq(esjTaskLinkTable.taskId, taskTable.id))
      .innerJoin(timeEntryTable, eq(timeEntryTable.taskId, taskTable.id))
      .where(inArray(esjTaskLinkTable.phaseId, phaseIds))
      .groupBy(esjTaskLinkTable.phaseId);

    for (const row of rows) {
      if (row.phaseId) secondsByPhase.set(row.phaseId, row.seconds ?? 0);
    }

    const ticketRows = await db
      .select({
        phaseId: esjTaskLinkTable.phaseId,
        count: sql<number>`count(*)::int`,
      })
      .from(esjTaskLinkTable)
      .where(inArray(esjTaskLinkTable.phaseId, phaseIds))
      .groupBy(esjTaskLinkTable.phaseId);

    for (const row of ticketRows) {
      if (row.phaseId) ticketsByPhase.set(row.phaseId, row.count ?? 0);
    }
  }

  const tonnage = Number.parseFloat(esjProject.totalTonnage ?? "0") || 0;

  const phasesWithTime = phases.map((phase) => {
    const seconds = secondsByPhase.get(phase.id) ?? 0;
    const hours = seconds / 3600;
    return {
      ...phase,
      ticketCount: ticketsByPhase.get(phase.id) ?? 0,
      loggedSeconds: seconds,
      loggedHours: Number(hours.toFixed(2)),
      hoursPerTon: tonnage > 0 ? Number((hours / tonnage).toFixed(4)) : null,
    };
  });

  const totalSeconds = Array.from(secondsByPhase.values()).reduce(
    (acc, value) => acc + value,
    0,
  );
  const totalHours = totalSeconds / 3600;

  return {
    esjProject,
    areas,
    phases: phasesWithTime,
    pieces,
    totals: {
      tonnage,
      loggedHours: Number(totalHours.toFixed(2)),
      hoursPerTon: tonnage > 0 ? Number((totalHours / tonnage).toFixed(4)) : null,
    },
  };
}

export default getEsjProject;

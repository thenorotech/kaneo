import { and, eq, max, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  esjPhaseTable,
  esjProjectTable,
  esjTaskLinkTable,
} from "../../database/schema";
import { slugify } from "../constants";

async function resolveEsjProject(projectId: string) {
  const [esjProject] = await db
    .select({ id: esjProjectTable.id, projectId: esjProjectTable.projectId })
    .from(esjProjectTable)
    .where(eq(esjProjectTable.projectId, projectId))
    .limit(1);

  if (!esjProject) {
    throw new HTTPException(404, {
      message: "Proyecto ESJ no encontrado para ese proyecto.",
    });
  }

  return esjProject;
}

/** Crea una nueva fase (división de trabajo paralelo) dentro de un proyecto. */
export async function createPhase({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new HTTPException(400, {
      message: "El nombre de la fase es obligatorio.",
    });
  }

  const esjProject = await resolveEsjProject(projectId);

  const [seq] = await db
    .select({ maxSequence: max(esjPhaseTable.sequence) })
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.esjProjectId, esjProject.id));

  const nextSequence = (seq?.maxSequence ?? -1) + 1;
  const slug = `${slugify(trimmed) || "fase"}-${nextSequence + 1}`;

  const [phase] = await db
    .insert(esjPhaseTable)
    .values({
      projectId,
      esjProjectId: esjProject.id,
      name: trimmed,
      slug,
      sequence: nextSequence,
      status: "pending",
    })
    .returning();

  if (!phase) {
    throw new HTTPException(500, { message: "No se pudo crear la fase." });
  }

  return phase;
}

/** Renombra una fase. */
export async function updatePhase({
  phaseId,
  name,
}: {
  phaseId: string;
  name: string;
}) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new HTTPException(400, {
      message: "El nombre de la fase es obligatorio.",
    });
  }

  const [updated] = await db
    .update(esjPhaseTable)
    .set({ name: trimmed })
    .where(eq(esjPhaseTable.id, phaseId))
    .returning();

  if (!updated) {
    throw new HTTPException(404, { message: "Fase no encontrada." });
  }

  return updated;
}

/** Elimina una fase. No se permite si todavía tiene tickets asociados. */
export async function deletePhase({ phaseId }: { phaseId: string }) {
  const [phase] = await db
    .select({ id: esjPhaseTable.id, esjProjectId: esjPhaseTable.esjProjectId })
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.id, phaseId))
    .limit(1);

  if (!phase) {
    throw new HTTPException(404, { message: "Fase no encontrada." });
  }

  const [ticketCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(esjTaskLinkTable)
    .where(eq(esjTaskLinkTable.phaseId, phaseId));

  if ((ticketCount?.count ?? 0) > 0) {
    throw new HTTPException(409, {
      message:
        "La fase tiene tickets. Mueve o elimina sus tickets antes de borrarla.",
    });
  }

  const [remaining] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.esjProjectId, phase.esjProjectId));

  if ((remaining?.count ?? 0) <= 1) {
    throw new HTTPException(409, {
      message: "Un proyecto debe tener al menos una fase.",
    });
  }

  const [deleted] = await db
    .delete(esjPhaseTable)
    .where(and(eq(esjPhaseTable.id, phaseId)))
    .returning();

  return deleted;
}

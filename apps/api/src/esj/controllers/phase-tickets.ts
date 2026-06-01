import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { esjPhaseTable, esjTaskLinkTable } from "../../database/schema";
import createTask from "../../task/controllers/create-task";
import getTasks from "../../task/controllers/get-tasks";

async function loadPhase(phaseId: string) {
  const [phase] = await db
    .select()
    .from(esjPhaseTable)
    .where(eq(esjPhaseTable.id, phaseId))
    .limit(1);

  if (!phase) {
    throw new HTTPException(404, { message: "Fase no encontrada." });
  }

  return phase;
}

/** Crea un ticket dentro de una fase y lo liga a la fase + etapa. */
export async function createPhaseTicket({
  phaseId,
  currentUserId,
  title,
  stage,
  assigneeId,
  priority,
  dueDate,
  description,
}: {
  phaseId: string;
  currentUserId: string;
  title: string;
  stage: string;
  assigneeId?: string;
  priority?: string;
  dueDate?: Date;
  description?: string;
}) {
  const phase = await loadPhase(phaseId);

  const task = await createTask({
    projectId: phase.projectId,
    currentUserId,
    userId: assigneeId,
    title,
    status: "to-do",
    priority,
    dueDate,
    description,
  });

  const [link] = await db
    .insert(esjTaskLinkTable)
    .values({
      taskId: task.id,
      projectId: phase.projectId,
      esjProjectId: phase.esjProjectId,
      phaseId: phase.id,
      areaId: phase.areaId,
      stage,
    })
    .returning();

  return { task, link };
}

/** Cambia la etapa de un ticket. */
export async function updateTicketStage({
  taskId,
  stage,
}: {
  taskId: string;
  stage: string;
}) {
  const [updated] = await db
    .update(esjTaskLinkTable)
    .set({ stage })
    .where(eq(esjTaskLinkTable.taskId, taskId))
    .returning();

  if (!updated) {
    throw new HTTPException(404, {
      message: "El ticket no pertenece a ningún proyecto ESJ.",
    });
  }

  return updated;
}

/**
 * Tablero de una fase: columnas estándar del proyecto kaneo, pero limitado a
 * los tickets ligados a esa fase, con su etapa adjunta a cada tarjeta.
 */
export async function getPhaseBoard(phaseId: string) {
  const phase = await loadPhase(phaseId);

  const links = await db
    .select({
      taskId: esjTaskLinkTable.taskId,
      stage: esjTaskLinkTable.stage,
    })
    .from(esjTaskLinkTable)
    .where(eq(esjTaskLinkTable.phaseId, phaseId));

  const stageByTask = new Map<string, string | null>();
  for (const link of links) {
    stageByTask.set(link.taskId, link.stage);
  }

  const { data } = await getTasks(phase.projectId);

  const columns = data.columns.map((column) => ({
    ...column,
    tasks: column.tasks
      .filter((task) => stageByTask.has(task.id))
      .map((task) => ({
        ...task,
        stage: stageByTask.get(task.id) ?? null,
      })),
  }));

  return {
    phase,
    board: {
      ...data,
      columns,
    },
  };
}

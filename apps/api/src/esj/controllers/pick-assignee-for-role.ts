import { and, eq, ne, sql } from "drizzle-orm";
import db from "../../database";
import {
  columnTable,
  esjRoleAssignmentTable,
  esjTaskLinkTable,
  taskTable,
} from "../../database/schema";

/**
 * Cola de trabajo del flujo: dado un rol, elige al miembro activo del
 * workspace con menos tareas ESJ abiertas (aproxima "la persona más próxima
 * a terminar o la que esté disponible" del diagrama). Devuelve null si no
 * hay nadie asignado a ese rol.
 */
export async function pickAssigneeForRole(
  workspaceId: string,
  roleKey: string | null | undefined,
): Promise<string | null> {
  if (!roleKey) return null;

  const candidates = await db
    .select({ userId: esjRoleAssignmentTable.userId })
    .from(esjRoleAssignmentTable)
    .where(
      and(
        eq(esjRoleAssignmentTable.workspaceId, workspaceId),
        eq(esjRoleAssignmentTable.roleKey, roleKey),
        eq(esjRoleAssignmentTable.isActive, true),
      ),
    );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0]?.userId ?? null;

  let best: { userId: string; openTasks: number } | null = null;
  for (const candidate of candidates) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(taskTable)
      .innerJoin(esjTaskLinkTable, eq(esjTaskLinkTable.taskId, taskTable.id))
      .leftJoin(columnTable, eq(taskTable.columnId, columnTable.id))
      .where(
        and(
          eq(taskTable.userId, candidate.userId),
          ne(taskTable.status, "done"),
          // Excluye tareas en columnas finales (p. ej. "Done").
          sql`(${columnTable.isFinal} is null or ${columnTable.isFinal} = false)`,
        ),
      );

    const openTasks = row?.count ?? 0;
    if (!best || openTasks < best.openTasks) {
      best = { userId: candidate.userId, openTasks };
    }
  }

  return best?.userId ?? null;
}

import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { esjRoleAssignmentTable, userTable } from "../../database/schema";
import { ESJ_ROLE_LABELS, isEsjRoleKey } from "../constants";

export async function listRoleAssignments(workspaceId: string) {
  const rows = await db
    .select({
      id: esjRoleAssignmentTable.id,
      workspaceId: esjRoleAssignmentTable.workspaceId,
      userId: esjRoleAssignmentTable.userId,
      roleKey: esjRoleAssignmentTable.roleKey,
      isActive: esjRoleAssignmentTable.isActive,
      userName: userTable.name,
      userEmail: userTable.email,
      createdAt: esjRoleAssignmentTable.createdAt,
      updatedAt: esjRoleAssignmentTable.updatedAt,
    })
    .from(esjRoleAssignmentTable)
    .innerJoin(userTable, eq(esjRoleAssignmentTable.userId, userTable.id))
    .where(eq(esjRoleAssignmentTable.workspaceId, workspaceId));

  return rows.map((row) => ({
    ...row,
    roleLabel: isEsjRoleKey(row.roleKey)
      ? ESJ_ROLE_LABELS[row.roleKey]
      : row.roleKey,
  }));
}

export async function assignRole({
  workspaceId,
  userId,
  roleKey,
}: {
  workspaceId: string;
  userId: string;
  roleKey: string;
}) {
  if (!isEsjRoleKey(roleKey)) {
    throw new HTTPException(400, {
      message: `Rol ESJ inválido: ${roleKey}`,
    });
  }

  const [assignment] = await db
    .insert(esjRoleAssignmentTable)
    .values({ workspaceId, userId, roleKey, isActive: true })
    .onConflictDoUpdate({
      target: [
        esjRoleAssignmentTable.workspaceId,
        esjRoleAssignmentTable.userId,
        esjRoleAssignmentTable.roleKey,
      ],
      set: { isActive: true },
    })
    .returning();

  if (!assignment) {
    throw new HTTPException(500, {
      message: "No se pudo asignar el rol.",
    });
  }

  return assignment;
}

export async function removeRoleAssignment({
  workspaceId,
  assignmentId,
}: {
  workspaceId: string;
  assignmentId: string;
}) {
  const [deleted] = await db
    .delete(esjRoleAssignmentTable)
    .where(
      and(
        eq(esjRoleAssignmentTable.id, assignmentId),
        eq(esjRoleAssignmentTable.workspaceId, workspaceId),
      ),
    )
    .returning();

  if (!deleted) {
    throw new HTTPException(404, {
      message: "Asignación de rol no encontrada.",
    });
  }

  return deleted;
}

import { and, desc, eq } from "drizzle-orm";
import db from "../../database";
import { esjProjectTable } from "../../database/schema";

/**
 * Cola/portafolio de proyectos ESJ de un workspace. Permite filtrar por
 * estado (p. ej. "pendiente" para la bandeja de revisión de PM/Planeación).
 */
async function listEsjProjects(workspaceId: string, status?: string) {
  const conditions = [eq(esjProjectTable.workspaceId, workspaceId)];
  if (status) {
    conditions.push(eq(esjProjectTable.status, status));
  }

  return db
    .select()
    .from(esjProjectTable)
    .where(and(...conditions))
    .orderBy(desc(esjProjectTable.createdAt));
}

export default listEsjProjects;

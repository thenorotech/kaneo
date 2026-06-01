import { and, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import {
  esjPhaseTable,
  esjProjectTable,
  esjTaskLinkTable,
  taskTable,
  timeEntryTable,
} from "../../database/schema";

type MetricsInput = {
  workspaceId: string;
  designType?: string;
  onlyClosed?: boolean;
};

function round(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

/**
 * Métrica de cotización: horas/tonelada por fase y por tipo de diseño,
 * agregando el histórico de proyectos del workspace. Es el insumo para
 * estimar tiempos (y por tanto costo) de proyectos futuros.
 */
async function getQuoteMetrics({
  workspaceId,
  designType,
  onlyClosed,
}: MetricsInput) {
  const conditions = [eq(esjProjectTable.workspaceId, workspaceId)];
  if (designType) conditions.push(eq(esjProjectTable.designType, designType));
  if (onlyClosed) conditions.push(eq(esjProjectTable.status, "cerrado"));

  const projects = await db
    .select({
      id: esjProjectTable.id,
      designType: esjProjectTable.designType,
      totalTonnage: esjProjectTable.totalTonnage,
      status: esjProjectTable.status,
    })
    .from(esjProjectTable)
    .where(and(...conditions));

  const tonnageByProject = new Map<string, number>();
  const designTypeByProject = new Map<string, string>();
  for (const project of projects) {
    tonnageByProject.set(
      project.id,
      Number.parseFloat(project.totalTonnage ?? "0") || 0,
    );
    designTypeByProject.set(project.id, project.designType ?? "sin-tipo");
  }

  const projectIds = projects.map((p) => p.id);

  type Bucket = {
    seconds: number;
    projectIds: Set<string>;
  };
  const byPhase = new Map<string, Bucket & { name: string }>();
  const byDesignType = new Map<
    string,
    { seconds: number; phases: Map<string, Bucket & { name: string }> }
  >();

  if (projectIds.length > 0) {
    const rows = await db
      .select({
        esjProjectId: esjPhaseTable.esjProjectId,
        slug: esjPhaseTable.slug,
        name: esjPhaseTable.name,
        seconds: sql<number>`coalesce(sum(${timeEntryTable.duration}), 0)::int`,
      })
      .from(esjTaskLinkTable)
      .innerJoin(taskTable, eq(esjTaskLinkTable.taskId, taskTable.id))
      .innerJoin(timeEntryTable, eq(timeEntryTable.taskId, taskTable.id))
      .innerJoin(esjPhaseTable, eq(esjTaskLinkTable.phaseId, esjPhaseTable.id))
      .where(inArray(esjPhaseTable.esjProjectId, projectIds))
      .groupBy(
        esjPhaseTable.esjProjectId,
        esjPhaseTable.slug,
        esjPhaseTable.name,
      );

    for (const row of rows) {
      const seconds = row.seconds ?? 0;
      if (seconds <= 0) continue;

      const phaseBucket = byPhase.get(row.slug) ?? {
        seconds: 0,
        projectIds: new Set<string>(),
        name: row.name,
      };
      phaseBucket.seconds += seconds;
      phaseBucket.projectIds.add(row.esjProjectId);
      byPhase.set(row.slug, phaseBucket);

      const dt = designTypeByProject.get(row.esjProjectId) ?? "sin-tipo";
      const dtBucket =
        byDesignType.get(dt) ??
        ({ seconds: 0, phases: new Map() } as {
          seconds: number;
          phases: Map<string, Bucket & { name: string }>;
        });
      dtBucket.seconds += seconds;
      const dtPhase = dtBucket.phases.get(row.slug) ?? {
        seconds: 0,
        projectIds: new Set<string>(),
        name: row.name,
      };
      dtPhase.seconds += seconds;
      dtPhase.projectIds.add(row.esjProjectId);
      dtBucket.phases.set(row.slug, dtPhase);
      byDesignType.set(dt, dtBucket);
    }
  }

  const sumTonnage = (ids: Set<string>) =>
    Array.from(ids).reduce((acc, id) => acc + (tonnageByProject.get(id) ?? 0), 0);

  const phaseMetrics = Array.from(byPhase.entries()).map(([slug, bucket]) => {
    const hours = bucket.seconds / 3600;
    const tonnage = sumTonnage(bucket.projectIds);
    return {
      phaseSlug: slug,
      phaseName: bucket.name,
      projectCount: bucket.projectIds.size,
      tonnage: round(tonnage, 2),
      hours: round(hours, 2),
      hoursPerTon: tonnage > 0 ? round(hours / tonnage) : null,
    };
  });

  const designTypeMetrics = Array.from(byDesignType.entries()).map(
    ([dt, bucket]) => {
      const phases = Array.from(bucket.phases.entries()).map(([slug, pb]) => {
        const hours = pb.seconds / 3600;
        const tonnage = sumTonnage(pb.projectIds);
        return {
          phaseSlug: slug,
          phaseName: pb.name,
          tonnage: round(tonnage, 2),
          hours: round(hours, 2),
          hoursPerTon: tonnage > 0 ? round(hours / tonnage) : null,
        };
      });
      const allIds = new Set<string>();
      for (const pb of bucket.phases.values()) {
        for (const id of pb.projectIds) allIds.add(id);
      }
      const hours = bucket.seconds / 3600;
      const tonnage = sumTonnage(allIds);
      return {
        designType: dt,
        hours: round(hours, 2),
        tonnage: round(tonnage, 2),
        hoursPerTon: tonnage > 0 ? round(hours / tonnage) : null,
        phases,
      };
    },
  );

  const totalSeconds = Array.from(byPhase.values()).reduce(
    (acc, b) => acc + b.seconds,
    0,
  );
  const totalHours = totalSeconds / 3600;
  const totalTonnage = projects.reduce(
    (acc, p) => acc + (Number.parseFloat(p.totalTonnage ?? "0") || 0),
    0,
  );

  return {
    workspaceId,
    filters: { designType: designType ?? null, onlyClosed: Boolean(onlyClosed) },
    projectCount: projects.length,
    totals: {
      hours: round(totalHours, 2),
      tonnage: round(totalTonnage, 2),
      hoursPerTon: totalTonnage > 0 ? round(totalHours / totalTonnage) : null,
    },
    byPhase: phaseMetrics,
    byDesignType: designTypeMetrics,
  };
}

export default getQuoteMetrics;

import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  esjAreaTable,
  esjPhaseTable,
  esjPieceTable,
  esjProjectTable,
  esjSapIntakeTable,
} from "../../database/schema";
import { publishEvent } from "../../events";
import createProject from "../../project/controllers/create-project";
import { ESJ_COMPLEXITY_TONNAGE_THRESHOLD, slugify } from "../constants";
import { parseSapEmail } from "../parse-sap-email";

type IntakeInput = {
  workspaceId: string;
  rawEmail: string;
  currentUserId: string;
};

// Decide el responsable inicial según el umbral del diagrama.
function resolveComplexityRouting(tonnage: number, areaCount: number) {
  const isHighComplexity =
    tonnage > ESJ_COMPLEXITY_TONNAGE_THRESHOLD || areaCount >= 2;
  return {
    complexity: isHighComplexity ? "alta" : "baja",
    routedTo: isHighComplexity ? "planeacion" : "project-manager",
  } as const;
}

async function intakeSapProject({
  workspaceId,
  rawEmail,
  currentUserId,
}: IntakeInput) {
  const parsed = parseSapEmail(rawEmail);

  // Idempotencia: un mismo Código SAP no debe duplicar el proyecto.
  const [existing] = await db
    .select({ id: esjProjectTable.id, projectId: esjProjectTable.projectId })
    .from(esjProjectTable)
    .where(eq(esjProjectTable.sapCode, parsed.sapCode))
    .limit(1);

  if (existing) {
    throw new HTTPException(409, {
      message: `Ya existe un proyecto ESJ para el Código SAP ${parsed.sapCode}.`,
    });
  }

  // Registra la ingesta (trazabilidad), o reutiliza si ya existía un intento.
  const [intake] = await db
    .insert(esjSapIntakeTable)
    .values({
      sapCode: parsed.sapCode,
      workspaceId,
      rawPayload: rawEmail,
      parsedData: parsed as unknown,
      status: "parsed",
    })
    .onConflictDoUpdate({
      target: esjSapIntakeTable.sapCode,
      set: {
        workspaceId,
        rawPayload: rawEmail,
        parsedData: parsed as unknown,
        status: "parsed",
        error: null,
      },
    })
    .returning();

  if (!intake) {
    throw new HTTPException(500, {
      message: "No se pudo registrar la ingesta del correo SAP.",
    });
  }

  try {
    // 1) Proyecto kaneo + columnas kanban por defecto (estado de tareas).
    const kaneoProject = await createProject(
      workspaceId,
      parsed.name,
      "Building2",
      slugify(parsed.sapCode),
    );

    if (!kaneoProject) {
      throw new HTTPException(500, {
        message: "No se pudo crear el proyecto base de kaneo.",
      });
    }

    const routing = resolveComplexityRouting(
      parsed.totalTonnage,
      parsed.areas.length,
    );

    // 2) Proyecto ESJ (metadata SAP).
    const [esjProject] = await db
      .insert(esjProjectTable)
      .values({
        projectId: kaneoProject.id,
        workspaceId,
        sapCode: parsed.sapCode,
        name: parsed.name,
        clientName: parsed.clientName,
        requester: parsed.requester,
        requiredDate: parsed.requiredDate,
        priority: parsed.priority,
        designType: parsed.designType,
        totalTonnage: parsed.totalTonnage.toString(),
        connectionDate: parsed.connectionDate,
        submittalDate: parsed.submittalDate,
        status: "pendiente",
        source: "sap-email",
      })
      .returning();

    if (!esjProject) {
      throw new HTTPException(500, {
        message: "No se pudo crear el proyecto ESJ.",
      });
    }

    // 3) Áreas. Con una sola área le asignamos todo el tonelaje; con varias
    // se deja en 0 para que el PM lo distribuya según presupuesto.
    const singleArea = parsed.areas.length === 1;
    const createdAreas: Array<{ id: string; name: string }> = [];
    for (let i = 0; i < parsed.areas.length; i++) {
      const areaName = parsed.areas[i];
      if (!areaName) continue;
      const [area] = await db
        .insert(esjAreaTable)
        .values({
          projectId: kaneoProject.id,
          esjProjectId: esjProject.id,
          name: areaName,
          tonnage: singleArea ? parsed.totalTonnage.toString() : "0",
          position: i,
        })
        .returning();
      if (area) createdAreas.push({ id: area.id, name: areaName });
    }
    const defaultAreaId =
      singleArea && createdAreas[0] ? createdAreas[0].id : null;

    // 4) Fase inicial. Una "Fase" es una división de trabajo en paralelo que
    // gestiona el PM (un edificio se reparte entre varios equipos). Al ingestar
    // el proyecto se crea solo "Fase 1"; el PM agrega las demás sobre la marcha
    // y dentro de cada fase crea los tickets, que avanzan por etapas.
    const [initialPhase] = await db
      .insert(esjPhaseTable)
      .values({
        projectId: kaneoProject.id,
        esjProjectId: esjProject.id,
        areaId: defaultAreaId,
        name: "Fase 1",
        slug: "fase-1",
        sequence: 0,
        status: "pending",
        dueDate: parsed.requiredDate,
      })
      .returning();

    const phaseSummaries = initialPhase
      ? [
          {
            id: initialPhase.id,
            name: initialPhase.name,
            slug: initialPhase.slug,
            sequence: initialPhase.sequence,
          },
        ]
      : [];

    // 5) Piezas/productos. El área/fase definitivos se asignan en ingeniería
    // de detalle; por ahora se ligan al área única si existe.
    for (const pieceCode of parsed.pieces) {
      await db.insert(esjPieceTable).values({
        projectId: kaneoProject.id,
        esjProjectId: esjProject.id,
        areaId: defaultAreaId,
        code: pieceCode,
        status: "pending",
      });
    }

    // 6) Cierra la ingesta como creada.
    await db
      .update(esjSapIntakeTable)
      .set({
        status: "created",
        projectId: kaneoProject.id,
        esjProjectId: esjProject.id,
        error: null,
      })
      .where(eq(esjSapIntakeTable.id, intake.id));

    await publishEvent("esj.project.created", {
      esjProjectId: esjProject.id,
      projectId: kaneoProject.id,
      sapCode: parsed.sapCode,
      currentUserId,
      complexity: routing.complexity,
      routedTo: routing.routedTo,
      type: "created",
      content: `Proyecto ESJ ${parsed.sapCode} creado desde correo SAP`,
    });

    return {
      esjProject,
      project: kaneoProject,
      routing,
      areas: createdAreas,
      phases: phaseSummaries,
      piecesCreated: parsed.pieces.length,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido en la ingesta";
    await db
      .update(esjSapIntakeTable)
      .set({ status: "failed", error: message })
      .where(eq(esjSapIntakeTable.id, intake.id));
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: `Falló la ingesta del proyecto SAP: ${message}`,
    });
  }
}

export default intakeSapProject;

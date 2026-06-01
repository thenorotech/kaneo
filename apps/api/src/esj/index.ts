import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import { ESJ_PHASE_STATUSES, ESJ_TICKET_STAGE_KEYS } from "./constants";
import getEsjProject from "./controllers/get-esj-project";
import getQuoteMetrics from "./controllers/get-quote-metrics";
import intakeSapProject from "./controllers/intake-sap-project";
import listEsjProjects from "./controllers/list-esj-projects";
import {
  createPhaseTicket,
  getPhaseBoard,
  updateTicketStage,
} from "./controllers/phase-tickets";
import { createPhase, deletePhase, updatePhase } from "./controllers/phases";
import {
  assignRole,
  listRoleAssignments,
  removeRoleAssignment,
} from "./controllers/role-assignments";
import updatePhaseStatus from "./controllers/update-phase-status";

const esj = new Hono<{
  Variables: {
    userId: string;
    workspaceId: string;
  };
}>()
  .post(
    "/intake",
    describeRoute({
      operationId: "intakeEsjSapProject",
      tags: ["ESJ"],
      description:
        "Crea un proyecto ESJ a partir del correo automático de SAP (zsd_email_cotizacion).",
      responses: {
        200: {
          description: "Proyecto ESJ creado desde el correo SAP",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        email: v.pipe(v.string(), v.minLength(1)),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ project: ["create"] }),
    async (c) => {
      const { email } = c.req.valid("json");
      const workspaceId = c.get("workspaceId");
      const currentUserId = c.get("userId");
      const result = await intakeSapProject({
        workspaceId,
        rawEmail: email,
        currentUserId,
      });
      return c.json(result);
    },
  )
  .get(
    "/",
    describeRoute({
      operationId: "listEsjProjects",
      tags: ["ESJ"],
      description: "Lista los proyectos ESJ del workspace (cola/portafolio).",
      responses: {
        200: {
          description: "Listado de proyectos ESJ",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator(
      "query",
      v.object({
        workspaceId: v.string(),
        status: v.optional(v.string()),
      }),
    ),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const { status } = c.req.valid("query");
      const projects = await listEsjProjects(workspaceId, status);
      return c.json(projects);
    },
  )
  .get(
    "/metrics",
    describeRoute({
      operationId: "getEsjQuoteMetrics",
      tags: ["ESJ"],
      description:
        "Métricas horas/tonelada por fase y tipo de diseño para cotizar proyectos futuros.",
      responses: {
        200: {
          description: "Métricas de cotización",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator(
      "query",
      v.object({
        workspaceId: v.string(),
        designType: v.optional(v.string()),
        onlyClosed: v.optional(v.string()),
      }),
    ),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const { designType, onlyClosed } = c.req.valid("query");
      const metrics = await getQuoteMetrics({
        workspaceId,
        designType,
        onlyClosed: onlyClosed === "true",
      });
      return c.json(metrics);
    },
  )
  .get(
    "/roles",
    describeRoute({
      operationId: "listEsjRoleAssignments",
      tags: ["ESJ"],
      description: "Lista las asignaciones de roles del flujo ESJ.",
      responses: {
        200: {
          description: "Asignaciones de roles",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const assignments = await listRoleAssignments(workspaceId);
      return c.json(assignments);
    },
  )
  .post(
    "/roles",
    describeRoute({
      operationId: "assignEsjRole",
      tags: ["ESJ"],
      description: "Asigna un rol del flujo ESJ a un usuario del workspace.",
      responses: {
        200: {
          description: "Rol asignado",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        userId: v.string(),
        roleKey: v.string(),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { userId, roleKey } = c.req.valid("json");
      const workspaceId = c.get("workspaceId");
      const assignment = await assignRole({ workspaceId, userId, roleKey });
      return c.json(assignment);
    },
  )
  .delete(
    "/roles/:id",
    describeRoute({
      operationId: "removeEsjRoleAssignment",
      tags: ["ESJ"],
      description: "Elimina una asignación de rol del flujo ESJ.",
      responses: {
        200: {
          description: "Asignación eliminada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const deleted = await removeRoleAssignment({
        workspaceId,
        assignmentId: id,
      });
      return c.json(deleted);
    },
  )
  .get(
    "/project/:id",
    describeRoute({
      operationId: "getEsjProject",
      tags: ["ESJ"],
      description:
        "Vista general de un proyecto ESJ (áreas, fases con tiempos, piezas).",
      responses: {
        200: {
          description: "Detalle del proyecto ESJ",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = await getEsjProject(id);
      return c.json(data);
    },
  )
  .patch(
    "/phase/:id/status",
    describeRoute({
      operationId: "updateEsjPhaseStatus",
      tags: ["ESJ"],
      description: "Actualiza el estado de una fase del proyecto ESJ.",
      responses: {
        200: {
          description: "Fase actualizada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        status: v.picklist(ESJ_PHASE_STATUSES),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ task: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");
      const currentUserId = c.get("userId");
      const updated = await updatePhaseStatus({
        phaseId: id,
        status,
        currentUserId,
      });
      return c.json(updated);
    },
  )
  .post(
    "/phase",
    describeRoute({
      operationId: "createEsjPhase",
      tags: ["ESJ"],
      description: "Crea una fase (división de trabajo paralelo) en un proyecto.",
      responses: {
        200: {
          description: "Fase creada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        projectId: v.string(),
        name: v.pipe(v.string(), v.minLength(1)),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ task: ["create"] }),
    async (c) => {
      const { projectId, name } = c.req.valid("json");
      const phase = await createPhase({ projectId, name });
      return c.json(phase);
    },
  )
  .patch(
    "/phase/:id",
    describeRoute({
      operationId: "renameEsjPhase",
      tags: ["ESJ"],
      description: "Renombra una fase.",
      responses: {
        200: {
          description: "Fase renombrada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        name: v.pipe(v.string(), v.minLength(1)),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ task: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { name } = c.req.valid("json");
      const updated = await updatePhase({ phaseId: id, name });
      return c.json(updated);
    },
  )
  .delete(
    "/phase/:id",
    describeRoute({
      operationId: "deleteEsjPhase",
      tags: ["ESJ"],
      description: "Elimina una fase sin tickets.",
      responses: {
        200: {
          description: "Fase eliminada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    requireWorkspacePermission({ task: ["delete"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const deleted = await deletePhase({ phaseId: id });
      return c.json(deleted);
    },
  )
  .get(
    "/phase/:id/board",
    describeRoute({
      operationId: "getEsjPhaseBoard",
      tags: ["ESJ"],
      description: "Tablero de una fase: columnas del proyecto con sus tickets.",
      responses: {
        200: {
          description: "Tablero de la fase",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = await getPhaseBoard(id);
      return c.json(data);
    },
  )
  .post(
    "/phase/:id/ticket",
    describeRoute({
      operationId: "createEsjPhaseTicket",
      tags: ["ESJ"],
      description: "Crea un ticket dentro de una fase, con su etapa.",
      responses: {
        200: {
          description: "Ticket creado",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        title: v.pipe(v.string(), v.minLength(1)),
        stage: v.picklist(ESJ_TICKET_STAGE_KEYS),
        assigneeId: v.optional(v.string()),
        priority: v.optional(v.string()),
        dueDate: v.optional(v.string()),
        description: v.optional(v.string()),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ task: ["create"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { title, stage, assigneeId, priority, dueDate, description } =
        c.req.valid("json");
      const currentUserId = c.get("userId");
      const ticket = await createPhaseTicket({
        phaseId: id,
        currentUserId,
        title,
        stage,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
      });
      return c.json(ticket);
    },
  )
  .patch(
    "/ticket/:taskId/stage",
    describeRoute({
      operationId: "updateEsjTicketStage",
      tags: ["ESJ"],
      description: "Cambia la etapa de un ticket.",
      responses: {
        200: {
          description: "Etapa actualizada",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ taskId: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        stage: v.picklist(ESJ_TICKET_STAGE_KEYS),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ task: ["update"] }),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const { stage } = c.req.valid("json");
      const updated = await updateTicketStage({ taskId, stage });
      return c.json(updated);
    },
  );

export default esj;

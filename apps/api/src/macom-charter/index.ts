import { sValidator as validator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import * as v from "valibot";
import { authenticateApiRequest } from "../utils/authenticate-api-request";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import { approveCharter } from "./controllers/approve-charter";
import { getCharter } from "./controllers/get-charter";
import { getEvents } from "./controllers/get-events";
import { getVersions } from "./controllers/get-versions";
import { returnCharter } from "./controllers/return-charter";
import { saveCharter } from "./controllers/save-charter";
import { submitCharter } from "./controllers/submit-charter";

export const macomCharterRouter = new Hono<{
  Variables: {
    userId: string;
    apiKeyId?: string;
    workspaceId: string;
    workspaceRole: string;
  };
}>();

// All charter routes require auth and project-level workspace access
macomCharterRouter.use("*", authenticateApiRequest);

// ------------------------------------------------------------------
// GET /:projectId
// ------------------------------------------------------------------
macomCharterRouter.get(
  "/:projectId",
  workspaceAccess.fromProject("projectId"), // Look up workspace ID from the project
  describeRoute({
    operationId: "getCharter",
    tags: ["MACOM Charter"],
    description: "Get project charter",
  }),
  validator("param", v.object({ projectId: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const data = await getCharter(projectId);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// POST /:projectId
// ------------------------------------------------------------------
const keyCollaboratorSchema = v.object({
  name: v.string(),
  role: v.string(),
  responsibility: v.string(),
});

const scheduleItemSchema = v.object({
  phase: v.string(),
  description: v.string(),
  startDate: v.string(),
  endDate: v.string(),
});

const relatedProjectSchema = v.object({
  code: v.string(),
  name: v.string(),
  department: v.string(),
  link: v.string(),
  contact: v.string(),
});

export const saveCharterBodySchema = v.object({
  projectName: v.optional(v.nullable(v.string())),
  projectType: v.optional(v.nullable(v.string())),
  responsibleArea: v.optional(v.nullable(v.string())),
  projectManager: v.optional(v.nullable(v.string())),
  objective: v.optional(v.nullable(v.string())),
  highLevelDescription: v.optional(v.nullable(v.string())),
  scope: v.optional(v.nullable(v.string())),
  keyDeliverables: v.optional(v.nullable(v.string())),
  highLevelRequirements: v.optional(v.nullable(v.string())),
  assumptionsRestrictions: v.optional(v.nullable(v.string())),
  overallRisk: v.optional(v.nullable(v.string())),
  successCriteria: v.optional(v.nullable(v.string())),
  kpis: v.optional(v.nullable(v.string())),
  trackingControlMechanism: v.optional(v.nullable(v.string())),
  necessaryResources: v.optional(v.nullable(v.string())),
  preliminaryBudget: v.optional(v.nullable(v.string())),
  criticalFactors: v.optional(v.nullable(v.string())),
  keyCollaborators: v.optional(v.nullable(v.array(keyCollaboratorSchema))),
  preliminarySchedule: v.optional(v.nullable(v.array(scheduleItemSchema))),
  communicationPlan: v.optional(v.nullable(v.array(v.string()))),
  relatedProjects: v.optional(v.nullable(v.array(relatedProjectSchema))),
  elaborationDate: v.optional(v.nullable(v.string())),
});

macomCharterRouter.post(
  "/:projectId",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "saveCharter",
    tags: ["MACOM Charter"],
    description: "Save or update project charter draft",
  }),
  validator("param", v.object({ projectId: v.string() })),
  validator("json", saveCharterBodySchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const userId = c.get("userId");
    const data = await saveCharter(projectId, userId, body);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// POST /:projectId/submit
// ------------------------------------------------------------------
macomCharterRouter.post(
  "/:projectId/submit",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "submitCharter",
    tags: ["MACOM Charter"],
    description: "Submit project charter for approval",
  }),
  validator("param", v.object({ projectId: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const userId = c.get("userId");
    const data = await submitCharter(projectId, userId);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// POST /:projectId/approve
// ------------------------------------------------------------------
macomCharterRouter.post(
  "/:projectId/approve",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "approveCharter",
    tags: ["MACOM Charter"],
    description: "Approve project charter (PM or Leader)",
  }),
  validator("param", v.object({ projectId: v.string() })),
  validator(
    "json",
    v.object({ role: v.union([v.literal("pm"), v.literal("leader")]) }),
  ),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const { role } = c.req.valid("json");
    const userId = c.get("userId");
    const data = await approveCharter(projectId, userId, role);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// POST /:projectId/return
// ------------------------------------------------------------------
macomCharterRouter.post(
  "/:projectId/return",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "returnCharter",
    tags: ["MACOM Charter"],
    description: "Return project charter with observations",
  }),
  validator("param", v.object({ projectId: v.string() })),
  validator("json", v.object({ comment: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const { comment } = c.req.valid("json");
    const userId = c.get("userId");
    const data = await returnCharter(projectId, userId, comment);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// GET /:projectId/versions
// ------------------------------------------------------------------
macomCharterRouter.get(
  "/:projectId/versions",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "getCharterVersions",
    tags: ["MACOM Charter"],
  }),
  validator("param", v.object({ projectId: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const data = await getVersions(projectId);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// GET /:projectId/events
// ------------------------------------------------------------------
macomCharterRouter.get(
  "/:projectId/events",
  workspaceAccess.fromProject("projectId"),
  describeRoute({
    operationId: "getCharterEvents",
    tags: ["MACOM Charter"],
  }),
  validator("param", v.object({ projectId: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const data = await getEvents(projectId);
    return c.json(data);
  },
);

export default macomCharterRouter;

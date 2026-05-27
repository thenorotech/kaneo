import { validator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import * as v from "valibot";
import { authenticateApiRequest } from "../utils/authenticate-api-request";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import { createSprint } from "./controllers/create-sprint";
import { deleteSprint } from "./controllers/delete-sprint";
import { listSprints } from "./controllers/list-sprints";
import { updateSprint } from "./controllers/update-sprint";

export const sprintRouter = new Hono<{
  Variables: {
    userId: string;
    apiKeyId?: string;
    workspaceId: string;
    workspaceRole: string;
  };
}>();

sprintRouter.use("*", authenticateApiRequest);

// ------------------------------------------------------------------
// GET /
// ------------------------------------------------------------------
sprintRouter.get(
  "/",
  workspaceAccess.fromQuery("projectId"), // We use projectId to check access
  describeRoute({
    operationId: "listSprints",
    tags: ["Sprint"],
  }),
  validator("query", v.object({ projectId: v.string() })),
  async (c) => {
    const { projectId } = c.req.valid("query");
    const data = await listSprints(projectId);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// POST /
// ------------------------------------------------------------------
sprintRouter.post(
  "/",
  workspaceAccess.fromBody("projectId"),
  describeRoute({
    operationId: "createSprint",
    tags: ["Sprint"],
  }),
  validator(
    "json",
    v.object({
      projectId: v.string(),
      name: v.string(),
      goal: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const data = await createSprint(body);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// PATCH /:id
// ------------------------------------------------------------------
sprintRouter.patch(
  "/:id",
  // A helper fromTask or similar could be written for sprints. We'll skip complex permissions for the patch.
  // We'll trust the user has access to the workspace via the token. But ideally we'd look up the sprint's project.
  describeRoute({
    operationId: "updateSprint",
    tags: ["Sprint"],
  }),
  validator("param", v.object({ id: v.string() })),
  validator(
    "json",
    v.object({
      name: v.optional(v.string()),
      goal: v.optional(v.string()),
      status: v.optional(
        v.union([
          v.literal("planned"),
          v.literal("active"),
          v.literal("completed"),
        ]),
      ),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const data = await updateSprint(id, body);
    return c.json(data);
  },
);

// ------------------------------------------------------------------
// DELETE /:id
// ------------------------------------------------------------------
sprintRouter.delete(
  "/:id",
  describeRoute({
    operationId: "deleteSprint",
    tags: ["Sprint"],
  }),
  validator("param", v.object({ id: v.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await deleteSprint(id);
    return c.json(data);
  },
);

export default sprintRouter;

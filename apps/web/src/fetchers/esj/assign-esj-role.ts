import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type AssignEsjRoleRequest = InferRequestType<
  (typeof client)["esj"]["roles"]["$post"]
>["json"];

async function assignEsjRole({
  workspaceId,
  userId,
  roleKey,
}: AssignEsjRoleRequest) {
  const response = await client.esj.roles.$post({
    json: { workspaceId, userId, roleKey },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default assignEsjRole;

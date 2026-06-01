import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetEsjRoleAssignmentsRequest = InferRequestType<
  (typeof client)["esj"]["roles"]["$get"]
>["query"];

async function getEsjRoleAssignments({
  workspaceId,
}: GetEsjRoleAssignmentsRequest) {
  if (!workspaceId) return [];

  const response = await client.esj.roles.$get({ query: { workspaceId } });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getEsjRoleAssignments;

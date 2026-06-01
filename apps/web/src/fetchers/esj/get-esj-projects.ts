import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetEsjProjectsRequest = InferRequestType<
  (typeof client)["esj"]["index"]["$get"]
>["query"];

async function getEsjProjects({ workspaceId, status }: GetEsjProjectsRequest) {
  if (!workspaceId) return [];

  const response = await client.esj.index.$get({
    query: { workspaceId, status },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getEsjProjects;

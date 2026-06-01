import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetEsjMetricsRequest = InferRequestType<
  (typeof client)["esj"]["metrics"]["$get"]
>["query"];

async function getEsjMetrics({
  workspaceId,
  designType,
  onlyClosed,
}: GetEsjMetricsRequest) {
  if (!workspaceId) return undefined;

  const response = await client.esj.metrics.$get({
    query: { workspaceId, designType, onlyClosed },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getEsjMetrics;

import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type ListSprintsRequest = InferRequestType<
  (typeof client)["sprint"]["$get"]
>["query"];

export async function listSprints({ projectId }: ListSprintsRequest) {
  const response = await client["sprint"].$get({
    query: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

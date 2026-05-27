import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetEventsRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["events"]["$get"]
>["param"];

export async function getCharterEvents({ projectId }: GetEventsRequest) {
  const response = await client["macom-charter"][":projectId"].events.$get({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

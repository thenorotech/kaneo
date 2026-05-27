import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetVersionsRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["versions"]["$get"]
>["param"];

export async function getCharterVersions({ projectId }: GetVersionsRequest) {
  const response = await client["macom-charter"][":projectId"].versions.$get({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

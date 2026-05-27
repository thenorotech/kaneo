import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["$get"]
>["param"];

export async function getCharter({ projectId }: GetCharterRequest) {
  const response = await client["macom-charter"][":projectId"].$get({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

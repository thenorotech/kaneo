import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type SubmitCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["submit"]["$post"]
>["param"];

export async function submitCharter({ projectId }: SubmitCharterRequest) {
  const response = await client["macom-charter"][":projectId"]["submit"].$post({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type AutoCreateRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["auto-create"]["$post"]
>["param"];

export async function autoCreateCharterTasks({ projectId }: AutoCreateRequest) {
  const response = await client["macom-charter"][":projectId"]["auto-create"].$post({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

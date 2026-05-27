import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type CreateSprintRequest = InferRequestType<
  (typeof client)["sprint"]["$post"]
>["json"];

export async function createSprint(data: CreateSprintRequest) {
  const response = await client["sprint"].$post({
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

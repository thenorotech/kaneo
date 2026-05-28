import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type SaveCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["$post"]
>;

export async function saveCharter({ projectId, json }: SaveCharterRequest) {
  const response = await client["macom-charter"][":projectId"].$post({
    param: { projectId },
    json,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

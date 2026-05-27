import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type ApproveCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["approve"]["$post"]
>["param"] & InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["approve"]["$post"]
>["json"];

export async function approveCharter({ projectId, role }: ApproveCharterRequest) {
  const response = await client["macom-charter"][":projectId"]["approve"].$post({
    param: { projectId },
    json: { role },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

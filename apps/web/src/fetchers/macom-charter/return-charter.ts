import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type ReturnCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["return"]["$post"]
>["param"] & InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["return"]["$post"]
>["json"];

export async function returnCharter({ projectId, comment }: ReturnCharterRequest) {
  const response = await client["macom-charter"][":projectId"]["return"].$post({
    param: { projectId },
    json: { comment },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

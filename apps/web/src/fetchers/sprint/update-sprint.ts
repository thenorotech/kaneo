import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type UpdateSprintRequest = InferRequestType<
  (typeof client)["sprint"][":id"]["$patch"]
>["param"] & {
  data: InferRequestType<(typeof client)["sprint"][":id"]["$patch"]>["json"];
};

export async function updateSprint({ id, data }: UpdateSprintRequest) {
  const response = await client["sprint"][":id"].$patch({
    param: { id },
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

type TicketStageJson = InferRequestType<
  (typeof client)["esj"]["ticket"][":taskId"]["stage"]["$patch"]
>["json"];

export type UpdateEsjTicketStageRequest = TicketStageJson & {
  taskId: string;
};

async function updateEsjTicketStage({
  taskId,
  ...json
}: UpdateEsjTicketStageRequest) {
  const response = await client.esj.ticket[":taskId"].stage.$patch({
    param: { taskId },
    json,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default updateEsjTicketStage;

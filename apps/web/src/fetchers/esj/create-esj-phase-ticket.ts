import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

type PhaseTicketJson = InferRequestType<
  (typeof client)["esj"]["phase"][":id"]["ticket"]["$post"]
>["json"];

export type CreateEsjPhaseTicketRequest = PhaseTicketJson & {
  phaseId: string;
};

async function createEsjPhaseTicket({
  phaseId,
  ...json
}: CreateEsjPhaseTicketRequest) {
  const response = await client.esj.phase[":id"].ticket.$post({
    param: { id: phaseId },
    json,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createEsjPhaseTicket;

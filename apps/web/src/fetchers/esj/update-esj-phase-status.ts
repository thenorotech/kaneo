import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

type PhaseStatusJson = InferRequestType<
  (typeof client)["esj"]["phase"][":id"]["status"]["$patch"]
>["json"];

export type UpdateEsjPhaseStatusRequest = PhaseStatusJson & {
  phaseId: string;
};

async function updateEsjPhaseStatus({
  phaseId,
  ...json
}: UpdateEsjPhaseStatusRequest) {
  const response = await client.esj.phase[":id"].status.$patch({
    param: { id: phaseId },
    json,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default updateEsjPhaseStatus;

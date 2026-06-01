import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

type RenamePhaseJson = InferRequestType<
  (typeof client)["esj"]["phase"][":id"]["$patch"]
>["json"];

export type RenameEsjPhaseRequest = RenamePhaseJson & {
  phaseId: string;
};

async function renameEsjPhase({ phaseId, ...json }: RenameEsjPhaseRequest) {
  const response = await client.esj.phase[":id"].$patch({
    param: { id: phaseId },
    json,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default renameEsjPhase;

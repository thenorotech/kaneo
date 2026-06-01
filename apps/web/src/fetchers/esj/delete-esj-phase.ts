import { client } from "@kaneo/libs";

export type DeleteEsjPhaseRequest = {
  phaseId: string;
  workspaceId: string;
};

async function deleteEsjPhase({ phaseId, workspaceId }: DeleteEsjPhaseRequest) {
  const response = await client.esj.phase[":id"].$delete({
    param: { id: phaseId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default deleteEsjPhase;

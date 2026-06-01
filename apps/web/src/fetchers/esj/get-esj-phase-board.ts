import { client } from "@kaneo/libs";

async function getEsjPhaseBoard(phaseId: string, workspaceId: string) {
  const response = await client.esj.phase[":id"].board.$get({
    param: { id: phaseId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getEsjPhaseBoard;

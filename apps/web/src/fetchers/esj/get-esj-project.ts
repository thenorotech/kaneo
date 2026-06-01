import { client } from "@kaneo/libs";

async function getEsjProject(projectId: string) {
  const response = await client.esj.project[":id"].$get({
    param: { id: projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getEsjProject;

import { client } from "@kaneo/libs";

export type RemoveEsjRoleAssignmentRequest = {
  assignmentId: string;
  workspaceId: string;
};

async function removeEsjRoleAssignment({
  assignmentId,
  workspaceId,
}: RemoveEsjRoleAssignmentRequest) {
  const response = await client.esj.roles[":id"].$delete({
    param: { id: assignmentId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default removeEsjRoleAssignment;

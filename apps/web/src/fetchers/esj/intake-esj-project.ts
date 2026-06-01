import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type IntakeEsjProjectRequest = InferRequestType<
  (typeof client)["esj"]["intake"]["$post"]
>["json"];

async function intakeEsjProject({ workspaceId, email }: IntakeEsjProjectRequest) {
  const response = await client.esj.intake.$post({
    json: { workspaceId, email },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default intakeEsjProject;

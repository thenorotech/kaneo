import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type CreateEsjPhaseRequest = InferRequestType<
  (typeof client)["esj"]["phase"]["$post"]
>["json"];

async function createEsjPhase(json: CreateEsjPhaseRequest) {
  const response = await client.esj.phase.$post({ json });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createEsjPhase;

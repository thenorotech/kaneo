import type { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type SaveCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["$post"]
>["param"] & {
  data: Record<string, unknown>;
};

export async function saveCharter({ projectId, data }: SaveCharterRequest) {
  // hono client might not know the exact body type if we didn't add a validator
  // but we can pass it as any or stringified.
  // Let's use fetch directly since we didn't add a validator to the POST route for body
  const response = await fetch(`/api/macom-charter/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

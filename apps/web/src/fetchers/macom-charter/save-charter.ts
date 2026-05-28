import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type SaveCharterRequest = InferRequestType<
  (typeof client)["macom-charter"][":projectId"]["$post"]
>["param"] & {
  data: Record<string, unknown>;
};

export async function saveCharter({ projectId, data }: SaveCharterRequest) {
  // hono client might not know the exact body type if we didn't add a validator
  // but we can pass it as any to send the json body dynamically.
  // biome-ignore lint/suspicious/noExplicitAny: bypass TypeScript typings for POST without body validator
  const response = await (client["macom-charter"][":projectId"] as any).$post({
    param: { projectId },
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

import * as v from "valibot";

export const macomCharterConfigSchema = v.object({
  // Empty config for now, internal plugin
});

export type MacomCharterConfig = v.InferOutput<typeof macomCharterConfigSchema>;

export async function validateMacomCharterConfig(
  config: unknown,
): Promise<{ valid: boolean; errors?: string[] }> {
  try {
    v.parse(macomCharterConfigSchema, config);
    return { valid: true };
  } catch (error) {
    if (error instanceof v.ValiError) {
      return {
        valid: false,
        errors: error.issues.map((issue) => issue.message),
      };
    }
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Invalid config"],
    };
  }
}

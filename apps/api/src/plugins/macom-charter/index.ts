import type { IntegrationPlugin } from "../types";
import { validateMacomCharterConfig } from "./config";

export const macomCharterPlugin: IntegrationPlugin = {
  type: "macom-charter",
  name: "MACOM Charter",
  validateConfig: validateMacomCharterConfig,
};

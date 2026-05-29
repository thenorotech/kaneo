import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("authenticateApiRequest route usage", () => {
  it("is not mounted directly as feature middleware", () => {
    const repoRoot = join(import.meta.dirname, "../../..");
    const featureRouters = [
      "apps/api/src/macom-charter/index.ts",
      "apps/api/src/sprint/index.ts",
    ];

    for (const routerPath of featureRouters) {
      const source = readFileSync(join(repoRoot, routerPath), "utf8");

      expect(source).not.toContain('use("*", authenticateApiRequest)');
    }
  });
});

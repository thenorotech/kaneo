import { HTTPException } from "hono/http-exception";
import { describe, expect, it } from "vitest";
import { normalizeCharterDate } from "../../../apps/api/src/macom-charter/controllers/save-charter";

describe("normalizeCharterDate", () => {
  it("clears empty charter dates instead of creating Invalid Date", () => {
    expect(normalizeCharterDate("")).toBeNull();
    expect(normalizeCharterDate(null)).toBeNull();
  });

  it("rejects invalid charter dates before they reach Postgres", () => {
    expect(() => normalizeCharterDate("not-a-date")).toThrow(HTTPException);
  });
});

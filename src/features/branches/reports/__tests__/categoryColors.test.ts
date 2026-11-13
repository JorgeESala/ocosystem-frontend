import { describe, expect, it } from "vitest";
import { colorForCategory } from "../utils/categoryColors";

describe("colorForCategory", () => {
  it("keeps the same color for the same category", () => {
    expect(colorForCategory(10)).toBe(colorForCategory(10));
  });

  it("uses different colors for different categories", () => {
    expect(colorForCategory(1)).not.toBe(colorForCategory(2));
  });
});

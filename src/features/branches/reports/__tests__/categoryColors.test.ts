import { describe, expect, it } from "vitest";
import { colorForCategory } from "../utils/categoryColors";

describe("colorForCategory", () => {
  it("keeps the same color for the same category", () => {
    expect(colorForCategory(10)).toBe(colorForCategory(10));
  });

  it("uses different colors for different categories", () => {
    expect(colorForCategory(1)).not.toBe(colorForCategory(2));
  });

  it("assigns distinct colors to a dozen visible categories", () => {
    const ids = Array.from({ length: 12 }, (_, index) => index + 1);
    const colors = new Set(ids.map(colorForCategory));
    expect(colors.size).toBe(ids.length);
  });

  it("uses a neutral color for the uncategorized bucket", () => {
    expect(colorForCategory(0)).not.toBe(colorForCategory(1));
  });
});

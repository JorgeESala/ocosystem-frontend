import { describe, expect, it } from "vitest";
import { branchExpensesKeys } from "../api/branch-expenses.keys";

describe("branchExpensesKeys.analytics", () => {
  it("serializes filters, granularity and the non-operating flag", () => {
    expect(
      branchExpensesKeys.analytics(
        [1, 2],
        [3, 4],
        [5, 6],
        "gas",
        "2026-01-01",
        "2026-01-31",
        "2025-12-01",
        "2025-12-31",
        "WEEK",
        true,
      ),
    ).toEqual([
      "branch-expenses",
      "analytics",
      "1,2",
      "3,4",
      "5,6",
      "gas",
      "2026-01-01",
      "2026-01-31",
      "2025-12-01",
      "2025-12-31",
      "WEEK",
      "all",
    ]);
  });

  it("uses operating when investments and loans are excluded", () => {
    expect(
      branchExpensesKeys.analytics(
        [],
        [],
        [],
        "",
        "a",
        "b",
        "c",
        "d",
        "MONTH",
        false,
      ),
    ).toContain("operating");
  });
});

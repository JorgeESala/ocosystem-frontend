import { describe, expect, it } from "vitest";
import { activeBranches } from "../reportBranches.queries";
import type { Branch } from "../types";
import type { ExcludedBranch } from "@/features/branches/checklist/types/excluded-branch.types";

const branches: Branch[] = [
  { id: 1, name: "Centro" },
  { id: 2, name: "Norte" },
  { id: 3, name: "Sur" },
];

describe("activeBranches", () => {
  it("returns every branch when nothing is excluded", () => {
    expect(activeBranches(branches, [])).toEqual(branches);
  });

  it("drops excluded branches and keeps the rest", () => {
    const excluded: ExcludedBranch[] = [
      { branchId: 2, reason: "cerrada" },
      { branchId: 3, reason: null },
    ];

    expect(activeBranches(branches, excluded)).toEqual([
      { id: 1, name: "Centro" },
    ]);
  });

  it("ignores exclusions for branches not in the list", () => {
    const excluded: ExcludedBranch[] = [{ branchId: 99, reason: "otra" }];

    expect(activeBranches(branches, excluded)).toEqual(branches);
  });
});

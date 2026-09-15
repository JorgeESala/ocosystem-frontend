import { describe, expect, it } from "vitest";
import { branchBatchesKeys } from "./branchBatches.keys";

describe("branchBatchesKeys", () => {
  it("scopea latest por unidad de negocio", () => {
    expect(branchBatchesKeys.latest("pollo-vivo")).toEqual([
      "batches",
      "latest",
      "pollo-vivo",
    ]);
    expect(branchBatchesKeys.latest("huevo")).not.toEqual(
      branchBatchesKeys.latest("pollo-vivo"),
    );
  });

  it("scopea search por unidad y filtros", () => {
    const from = new Date("2026-01-01T00:00:00");
    const to = new Date("2026-01-31T00:00:00");

    expect(branchBatchesKeys.search("pollo-vivo", [1, 2], from, to)).toEqual([
      "batches",
      "search",
      "pollo-vivo",
      [1, 2],
      from,
      to,
    ]);
    expect(branchBatchesKeys.search("huevo", [1, 2], from, to)).not.toEqual(
      branchBatchesKeys.search("pollo-vivo", [1, 2], from, to),
    );
  });
});

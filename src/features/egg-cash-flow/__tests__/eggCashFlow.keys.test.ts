import { describe, expect, it } from "vitest";
import { eggCashFlowKeys } from "../api/eggCashFlow.keys";
import type { EggCashFlowUnit } from "../types/eggCashFlow.types";

describe("eggCashFlowKeys", () => {
  it("scopes the base key by unit", () => {
    expect(eggCashFlowKeys("EGG").all).toEqual(["egg-cash-flow", "EGG"]);
  });

  it("prefixes every sub key with the unit discriminant", () => {
    const keys = eggCashFlowKeys("EGG");
    const subKeys = [
      keys.settings(),
      keys.summary("2026-10-01", "2026-10-07"),
      keys.movements("2026-10-01", "2026-10-07"),
      keys.tripSuggestions("2026-10-01", "2026-10-07"),
      keys.collectionSuggestions("2026-10-01", "2026-10-07"),
      keys.remesas(),
      keys.availableExpenses("2026-10-01", "2026-10-07"),
      keys.cuts(),
    ];

    for (const key of subKeys) {
      expect(key[0]).toBe("egg-cash-flow");
      expect(key[1]).toBe("EGG");
    }
  });

  it("produces different keys for different units", () => {
    const egg = eggCashFlowKeys("EGG");
    const other = eggCashFlowKeys("LIVE_CHICKEN" as EggCashFlowUnit);

    expect(other.settings()).not.toEqual(egg.settings());
    expect(JSON.stringify(other.cuts())).toContain("LIVE_CHICKEN");
    expect(JSON.stringify(egg.cuts())).toContain("EGG");
    expect(JSON.stringify(egg.cuts())).not.toContain("LIVE_CHICKEN");
  });
});

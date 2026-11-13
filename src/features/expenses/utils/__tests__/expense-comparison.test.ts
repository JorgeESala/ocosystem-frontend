import { describe, expect, it } from "vitest";
import {
  buildComparisonHighlights,
  comparisonAmountVariationLabel,
  comparisonCountVariationLabel,
  comparisonVariationLabel,
  filterComparisonItems,
  formatSignedAmount,
  formatSignedCount,
} from "../expense-comparison";
import { formatMXN } from "@/utils/moneyNumbers";

const item = (
  label: string,
  currentCount: number,
  previousCount: number,
  currentAmount: number,
  previousAmount: number,
) => ({
  code: label,
  label,
  currentCount,
  previousCount,
  currentAmount,
  previousAmount,
  amountDifference: currentAmount - previousAmount,
  amountVariationPct:
    previousAmount === 0
      ? null
      : ((currentAmount - previousAmount) / previousAmount) * 100,
  countDifference: currentCount - previousCount,
  countVariationPct:
    previousCount === 0
      ? null
      : ((currentCount - previousCount) / previousCount) * 100,
  newInCurrent: previousCount === 0 && currentCount > 0,
});

describe("buildComparisonHighlights", () => {
  it("finds the largest increase and decrease in registros and monto", () => {
    const highlights = buildComparisonHighlights([
      item("Combustible", 32, 16, 3200, 1600),
      item("Limpieza", 4, 10, 400, 1000),
      item("Alimento", 10, 10, 900, 900),
      item("Renta", 2, 1, 5000, 5000),
    ]);

    expect(highlights.topCountIncrease?.label).toBe("Combustible");
    expect(highlights.topCountIncrease?.countDifference).toBe(16);
    expect(highlights.topCountDecrease?.label).toBe("Limpieza");
    expect(highlights.topCountDecrease?.countDifference).toBe(-6);
    expect(highlights.topAmountIncrease?.label).toBe("Combustible");
    expect(highlights.topAmountIncrease?.amountDifference).toBe(1600);
    expect(highlights.topAmountDecrease?.label).toBe("Limpieza");
    expect(highlights.topAmountDecrease?.amountDifference).toBe(-600);
  });

  it("returns no highlight when there is no increase or decrease", () => {
    const highlights = buildComparisonHighlights([
      item("Alimento", 10, 10, 900, 900),
      item("Renta", 2, 2, 5000, 5000),
    ]);

    expect(highlights.topCountIncrease).toBeUndefined();
    expect(highlights.topCountDecrease).toBeUndefined();
    expect(highlights.topAmountIncrease).toBeUndefined();
    expect(highlights.topAmountDecrease).toBeUndefined();
  });
});

describe("formatSignedCount", () => {
  it("adds a plus sign only to positive values", () => {
    expect(formatSignedCount(16)).toBe("+16");
    expect(formatSignedCount(-6)).toBe("-6");
    expect(formatSignedCount(0)).toBe("0");
  });
});

describe("formatSignedAmount", () => {
  it("adds a plus sign only to positive amounts", () => {
    expect(formatSignedAmount(1600)).toBe(`+${formatMXN(1600)}`);
    expect(formatSignedAmount(-600)).toBe(formatMXN(-600));
    expect(formatSignedAmount(0)).toBe(formatMXN(0));
  });
});

describe("comparison item variation labels", () => {
  it("uses the new flag for counts and removes the flag for amounts", () => {
    expect(comparisonCountVariationLabel(item("Nuevo", 2, 0, 200, 0))).toBe(
      "Nuevo",
    );
    expect(comparisonCountVariationLabel(item("Baja", 0, 2, 0, 200))).toBe(
      "-100.0%",
    );
    expect(comparisonAmountVariationLabel(item("Nuevo", 2, 0, 200, 0))).toBe(
      "Nuevo",
    );
    expect(comparisonAmountVariationLabel(item("Baja", 0, 2, 0, 200))).toBe(
      "-100.0%",
    );
  });
});

describe("filterComparisonItems", () => {
  it("filters by label ignoring case and whitespace", () => {
    const items = [
      item("Combustible", 2, 1, 200, 100),
      item("Limpieza", 1, 1, 50, 50),
    ];

    expect(filterComparisonItems(items, "  gas ")).toEqual([]);
    expect(filterComparisonItems(items, " comb ")).toEqual([items[0]]);
    expect(filterComparisonItems(items, "")).toEqual(items);
  });
});

describe("comparisonVariationLabel", () => {
  it("marks a concept as new when the previous period is zero", () => {
    expect(comparisonVariationLabel(1, 0, null)).toBe("Nuevo");
  });

  it("shows -100% when the concept disappeared", () => {
    expect(comparisonVariationLabel(0, 3, -100)).toBe("-100.0%");
  });

  it("formats positive and negative variations with a sign", () => {
    expect(comparisonVariationLabel(5, 2, 150)).toBe("+150.0%");
    expect(comparisonVariationLabel(2, 5, -60)).toBe("-60.0%");
  });

  it("shows no change for a zero variation", () => {
    expect(comparisonVariationLabel(3, 3, 0)).toBe("0.0%");
  });

  it("shows a dash when there is no comparable base", () => {
    expect(comparisonVariationLabel(0, 0, null)).toBe("—");
  });
});

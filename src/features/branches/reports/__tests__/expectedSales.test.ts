import { describe, expect, it } from "vitest";
import type { DailyExpectedSalesDTO } from "../api/expectedSales.api";
import {
  aggregateExpectedDaily,
  expectedVariancePct,
  formatBirds,
  formatChickenWeight,
  formatExpectedTooltipLabel,
  formatExpectedTooltipValue,
  formatKg,
  formatVariance,
} from "../utils/expectedSales";

const daily = (
  overrides: Partial<DailyExpectedSalesDTO> = {},
): DailyExpectedSalesDTO => ({
  branchId: 1,
  branchName: "Centro",
  day: "2026-06-01",
  expectedKg: 100,
  reportedKg: 120,
  differenceKg: 20,
  variancePct: 20,
  birdsSold: 10,
  avgChickenWeight: 1.8,
  salesCount: 1,
  salesWithoutWeight: 0,
  ...overrides,
});

describe("expectedVariancePct", () => {
  it("computes the variance against expected kg", () => {
    expect(expectedVariancePct(100, 110)).toBeCloseTo(10);
    expect(expectedVariancePct(100, 90)).toBeCloseTo(-10);
  });

  it("returns null without a usable expected value", () => {
    expect(expectedVariancePct(null, 100)).toBeNull();
    expect(expectedVariancePct(0, 100)).toBeNull();
    expect(expectedVariancePct(100, null)).toBeNull();
  });
});

describe("aggregateExpectedDaily", () => {
  it("sums branches on the same day and keeps a weighted average", () => {
    const rows = aggregateExpectedDaily([
      daily(),
      daily({
        branchId: 2,
        branchName: "Norte",
        expectedKg: 200,
        reportedKg: 180,
        differenceKg: -20,
        variancePct: -10,
        birdsSold: 20,
        avgChickenWeight: 1.9,
      }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].expectedKg).toBeCloseTo(300);
    expect(rows[0].reportedKg).toBeCloseTo(300);
    expect(rows[0].differenceKg).toBeCloseTo(0);
    expect(rows[0].variancePct).toBeCloseTo(0);
    expect(rows[0].birdsSold).toBe(30);
    expect(rows[0].avgChickenWeight).toBeCloseTo((1.8 * 10 + 1.9 * 20) / 30);
  });

  it("keeps expected and reported null when there is no data", () => {
    const rows = aggregateExpectedDaily([
      daily({
        expectedKg: null,
        reportedKg: null,
        differenceKg: null,
        variancePct: null,
        birdsSold: 0,
        avgChickenWeight: null,
        salesCount: 0,
        salesWithoutWeight: 1,
      }),
    ]);

    expect(rows[0].expectedKg).toBeNull();
    expect(rows[0].reportedKg).toBeNull();
    expect(rows[0].differenceKg).toBeNull();
    expect(rows[0].variancePct).toBeNull();
    expect(rows[0].salesWithoutWeight).toBe(1);
  });

  it("sorts days ascending", () => {
    const rows = aggregateExpectedDaily([
      daily({ day: "2026-06-02" }),
      daily({ day: "2026-06-01" }),
    ]);

    expect(rows.map((row) => row.day)).toEqual(["2026-06-01", "2026-06-02"]);
  });
});

describe("expected sales formatters", () => {
  it("formats kilograms and birds", () => {
    expect(formatKg(1234.5)).toBe("1,234.5 kg");
    expect(formatKg(null)).toBe("—");
    expect(formatBirds(350)).toBe("350");
    expect(formatBirds(null)).toBe("—");
    expect(formatChickenWeight(1.8286)).toBe("1.829 kg");
    expect(formatChickenWeight(null)).toBe("—");
  });

  it("formats signed variances", () => {
    expect(formatVariance(13.68)).toBe("+13.7%");
    expect(formatVariance(-4.25)).toBe("-4.3%");
    expect(formatVariance(0)).toBe("0.0%");
    expect(formatVariance(null)).toBe("—");
  });

  it("formats the chart tooltip label and values", () => {
    expect(formatExpectedTooltipLabel("2026-06-01")).toContain("jun");
    expect(formatExpectedTooltipValue(1050, "Kg vendidos")).toEqual([
      "1,050 kg",
      "Kg vendidos",
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { computeBaseline, analyzeSalesAnomalies } from "../utils/anomalies";
import type { DailySalesDTO } from "../types";

const day = (
  date: string,
  chickenByBranch: Record<string, number> = {},
  eggsByBranch: Record<string, number> = {},
): DailySalesDTO => ({
  date,
  chickenByBranch,
  eggsByBranch,
  totalChicken: 0,
  totalEggs: 0,
});

const saturday = 6;
const monday = 1;
const tuesday = 2;

describe("computeBaseline", () => {
  it("uses the median of same-weekday quantities per branch", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 145 }),
      day("2026-07-13", { Saban: 200 }),
      day("2026-07-20", { Saban: 300 }),
    ];

    const baseline = computeBaseline(dailySales, (d) => d.chickenByBranch);

    expect(baseline.get("Roneli")?.get(saturday)?.expected).toBe(100);
    expect(baseline.get("Roneli")?.get(saturday)?.samples).toBe(4);
    expect(baseline.get("Saban")?.get(monday)?.expected).toBe(250);
  });

  it("does not count days without data for the branch", () => {
    const dailySales = [
      day("2026-07-13", { Roneli: 100 }),
      day("2026-07-20"),
      day("2026-07-27", { Roneli: 100 }),
    ];

    const baseline = computeBaseline(dailySales, (d) => d.chickenByBranch);

    expect(baseline.get("Roneli")?.get(monday)?.expected).toBe(100);
    expect(baseline.get("Roneli")?.get(monday)?.samples).toBe(2);
  });

  it("counts explicit zeros as data points", () => {
    const dailySales = [
      day("2026-07-14", { Roneli: 0 }),
      day("2026-07-21", { Roneli: 0 }),
      day("2026-07-28", { Roneli: 0 }),
    ];

    const baseline = computeBaseline(dailySales, (d) => d.chickenByBranch);

    expect(baseline.get("Roneli")?.get(tuesday)?.expected).toBe(0);
    expect(baseline.get("Roneli")?.get(tuesday)?.samples).toBe(3);
  });
});

describe("analyzeSalesAnomalies", () => {
  it("flags a spike above the threshold", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 145 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0]).toMatchObject({
      branch: "Roneli",
      date: "2026-08-01",
      weekday: saturday,
      actual: 145,
      expected: 100,
      direction: "spike",
    });
    expect(anomalies[0].deviationPct).toBeCloseTo(45, 1);
  });

  it("flags a dip below the threshold", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 30 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0]).toMatchObject({
      direction: "dip",
      deviationPct: -70,
    });
  });

  it("does not flag normal days within the threshold", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 112 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toEqual([]);
  });

  it("flags exactly at the threshold and not below it", () => {
    const atThreshold = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 130 }),
    ];
    const belowThreshold = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 129.9 }),
    ];

    expect(
      analyzeSalesAnomalies(atThreshold, (d) => d.chickenByBranch).anomalies,
    ).toHaveLength(1);
    expect(
      analyzeSalesAnomalies(belowThreshold, (d) => d.chickenByBranch).anomalies,
    ).toEqual([]);
  });

  it("does not flag zero-heavy weekdays and never divides by zero", () => {
    const dailySales = [
      day("2026-07-14", { Roneli: 0 }),
      day("2026-07-21", { Roneli: 0 }),
      day("2026-07-28", { Roneli: 0 }),
      day("2026-08-04", { Roneli: 100 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toEqual([]);
  });

  it("does not flag branches without enough history", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100, Saban: 100 }),
      day("2026-07-25", { Roneli: 100, Saban: 100 }),
      day("2026-08-01", { Roneli: 145, Saban: 300 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].branch).toBe("Roneli");
  });

  it("isolates branches from each other", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100, Saban: 200 }),
      day("2026-07-18", { Roneli: 100, Saban: 200 }),
      day("2026-07-25", { Roneli: 100, Saban: 200 }),
      day("2026-08-01", { Roneli: 145, Saban: 200 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].branch).toBe("Roneli");
  });

  it("uses the eggs source when the selector returns eggsByBranch", () => {
    const dailySales = [
      day("2026-07-11", {}, { Roneli: 10 }),
      day("2026-07-18", {}, { Roneli: 10 }),
      day("2026-07-25", {}, { Roneli: 10 }),
      day("2026-08-01", {}, { Roneli: 16 }),
    ];

    const { anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.eggsByBranch,
    );

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].actual).toBe(16);
    expect(anomalies[0].deviationPct).toBeCloseTo(60, 1);
  });

  it("respects a custom threshold", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 145 }),
    ];

    const strict = analyzeSalesAnomalies(dailySales, (d) => d.chickenByBranch, {
      thresholdPct: 50,
    }).anomalies;
    const relaxed = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
      { thresholdPct: 40 },
    ).anomalies;

    expect(strict).toEqual([]);
    expect(relaxed).toHaveLength(1);
  });

  it("respects a custom minSamples", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 160 }),
    ];

    const strict = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    ).anomalies;
    const relaxed = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
      {
        minSamples: 2,
      },
    ).anomalies;

    expect(strict).toEqual([]);
    expect(relaxed).toHaveLength(1);
    expect(relaxed[0]).toMatchObject({ branch: "Roneli", direction: "spike" });
  });

  it("counts analyzed days for the history check", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 145 }),
    ];

    const { analyzedDays } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(analyzedDays).toBe(4);
  });

  it("builds chart series with expected and threshold bounds", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
      day("2026-08-01", { Roneli: 145 }),
    ];

    const { series } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    const last = series[series.length - 1];
    expect(last.date).toBe("2026-08-01");
    expect(last.Roneli).toBe(145);
    expect(last["Roneli.exp"]).toBeCloseTo(100);
    expect(last["Roneli.hi"]).toBeCloseTo(130);
    expect(last["Roneli.lo"]).toBeCloseTo(70);
  });

  it("reports analyzedDays zero when nothing has enough history", () => {
    const dailySales = [
      day("2026-07-11", { Roneli: 100 }),
      day("2026-07-18", { Roneli: 100 }),
      day("2026-07-25", { Roneli: 100 }),
    ];

    const { analyzedDays, anomalies } = analyzeSalesAnomalies(
      dailySales,
      (d) => d.chickenByBranch,
    );

    expect(analyzedDays).toBe(0);
    expect(anomalies).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import {
  buildWeekProfiles,
  computeWeekTotals,
  filterDrawableProfiles,
} from "../utils/weekProfile";
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

describe("buildWeekProfiles", () => {
  it("groups days into Monday-start weeks and returns the last weeks oldest-first", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-25", { Roneli: 120 }),
      day("2026-07-27", { Roneli: 130 }),
      day("2026-08-01", { Roneli: 140 }),
      day("2026-08-03", { Roneli: 105 }),
    ];

    const profiles = buildWeekProfiles(dailySales, (d) => d.chickenByBranch);

    expect(profiles).toHaveLength(3);
    expect(profiles.map((p) => p.weekStart)).toEqual([
      "2026-07-20",
      "2026-07-27",
      "2026-08-03",
    ]);
    expect(profiles[0].branch).toBe("Roneli");
  });

  it("fills all seven weekdays in Monday-first order with null gaps", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-25", { Roneli: 120 }),
    ];

    const [profile] = buildWeekProfiles(dailySales, (d) => d.chickenByBranch);

    expect(profile.days[1]).toBe(100);
    expect(profile.days[2]).toBe(110);
    expect(profile.days[3]).toBeNull();
    expect(profile.days[4]).toBeNull();
    expect(profile.days[5]).toBeNull();
    expect(profile.days[6]).toBe(120);
    expect(profile.days[0]).toBeNull();
  });

  it("keeps explicit zeros as data and null only for missing days", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 0 }),
    ];

    const [profile] = buildWeekProfiles(dailySales, (d) => d.chickenByBranch);

    expect(profile.days[1]).toBe(100);
    expect(profile.days[2]).toBe(0);
  });

  it("isolates branches from each other", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100, Saban: 50 }),
      day("2026-07-21", { Roneli: 110, Saban: 60 }),
      day("2026-07-27", { Roneli: 130, Saban: 70 }),
    ];

    const profiles = buildWeekProfiles(dailySales, (d) => d.chickenByBranch);

    expect(profiles).toHaveLength(4);
    const roneliWeeks = profiles.filter((p) => p.branch === "Roneli");
    const sabanWeeks = profiles.filter((p) => p.branch === "Saban");
    expect(roneliWeeks).toHaveLength(2);
    expect(sabanWeeks).toHaveLength(2);
    expect(roneliWeeks[0].days[1]).toBe(100);
    expect(sabanWeeks[0].days[1]).toBe(50);
  });

  it("returns fewer weeks than the requested window when unavailable", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
    ];

    const profiles = buildWeekProfiles(dailySales, (d) => d.chickenByBranch, {
      weeks: 4,
    });

    expect(profiles).toHaveLength(1);
  });

  it("returns an empty array when dailySales is empty", () => {
    expect(buildWeekProfiles([], (d) => d.chickenByBranch)).toEqual([]);
  });

  it("uses the eggs source when the selector returns eggsByBranch", () => {
    const dailySales = [
      day("2026-07-20", {}, { Roneli: 10 }),
      day("2026-07-21", {}, { Roneli: 12 }),
    ];

    const [profile] = buildWeekProfiles(dailySales, (d) => d.eggsByBranch);

    expect(profile.days[1]).toBe(10);
    expect(profile.days[2]).toBe(12);
  });

  it("formats a short es-MX week label from the Monday", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-27", { Roneli: 130 }),
    ];

    const profiles = buildWeekProfiles(dailySales, (d) => d.chickenByBranch);

    expect(profiles[0].weekLabel).toBe("20 jul");
    expect(profiles[1].weekLabel).toBe("27 jul");
  });
});

describe("filterDrawableProfiles", () => {
  const rangeStartingMidWeek = [
    day("2026-07-22", { Roneli: 100 }),
    day("2026-07-27", { Roneli: 110 }),
    day("2026-07-29", { Roneli: 120 }),
    day("2026-08-03", { Roneli: 130 }),
    day("2026-08-05", { Roneli: 140 }),
  ];

  it("drops previous weeks truncated by the range start and keeps the current partial week", () => {
    const profiles = buildWeekProfiles(
      rangeStartingMidWeek,
      (d) => d.chickenByBranch,
    );

    const drawable = filterDrawableProfiles(profiles, rangeStartingMidWeek, 4);

    expect(drawable.map((p) => p.weekStart)).toEqual([
      "2026-07-27",
      "2026-08-03",
    ]);
  });

  it("caps the number of weeks shown per branch", () => {
    const profiles = buildWeekProfiles(
      rangeStartingMidWeek,
      (d) => d.chickenByBranch,
    );

    const drawable = filterDrawableProfiles(profiles, rangeStartingMidWeek, 1);

    expect(drawable.map((p) => p.weekStart)).toEqual(["2026-08-03"]);
  });

  it("keeps previous weeks fully inside the range", () => {
    const fullRange = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-27", { Roneli: 120 }),
      day("2026-07-28", { Roneli: 130 }),
    ];

    const profiles = buildWeekProfiles(fullRange, (d) => d.chickenByBranch);

    const drawable = filterDrawableProfiles(profiles, fullRange, 4);

    expect(drawable.map((p) => p.weekStart)).toEqual([
      "2026-07-20",
      "2026-07-27",
    ]);
  });

  it("keeps the current week even when the range starts mid-week", () => {
    const onlyCurrent = [
      day("2026-08-03", { Roneli: 130 }),
      day("2026-08-05", { Roneli: 140 }),
    ];

    const profiles = buildWeekProfiles(onlyCurrent, (d) => d.chickenByBranch);

    const drawable = filterDrawableProfiles(profiles, onlyCurrent, 4);

    expect(drawable.map((p) => p.weekStart)).toEqual(["2026-08-03"]);
  });

  it("caps weeks independently per branch", () => {
    const twoBranches = [
      day("2026-07-22", { Roneli: 100, Saban: 50 }),
      day("2026-07-27", { Roneli: 110, Saban: 55 }),
      day("2026-07-29", { Roneli: 120, Saban: 60 }),
      day("2026-08-03", { Roneli: 130, Saban: 65 }),
      day("2026-08-05", { Roneli: 140, Saban: 70 }),
    ];

    const profiles = buildWeekProfiles(twoBranches, (d) => d.chickenByBranch);

    const drawable = filterDrawableProfiles(profiles, twoBranches, 1);

    expect(drawable).toHaveLength(2);
    expect(drawable.map((p) => p.weekStart)).toEqual([
      "2026-08-03",
      "2026-08-03",
    ]);
    expect(drawable.map((p) => p.branch)).toEqual(["Roneli", "Saban"]);
  });

  it("returns an empty array when dailySales or profiles are empty", () => {
    expect(filterDrawableProfiles([], [], 4)).toEqual([]);
    expect(
      filterDrawableProfiles([], [day("2026-08-03", { Roneli: 130 })], 4),
    ).toEqual([]);
  });
});

describe("computeWeekTotals", () => {
  it("compares only the days with data in the current week (morning before the report upload)", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-22", { Roneli: 120 }),
      day("2026-07-27", { Roneli: 130 }),
      day("2026-07-28", { Roneli: 140 }),
      day("2026-07-29"),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals).toHaveLength(1);
    expect(totals[0]).toMatchObject({
      branch: "Roneli",
      currentWeek: 270,
      previousWeek: 210,
      windowDays: 2,
      currentPartial: true,
      missingToday: true,
      missingPrevDays: 0,
    });
    expect(totals[0].changePct).toBeCloseTo(28.6, 1);
  });

  it("compares full week against full week when the range ends on Sunday", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
      day("2026-07-22", { Roneli: 120 }),
      day("2026-07-23", { Roneli: 130 }),
      day("2026-07-24", { Roneli: 140 }),
      day("2026-07-25", { Roneli: 150 }),
      day("2026-07-26", { Roneli: 160 }),
      day("2026-07-27", { Roneli: 170 }),
      day("2026-07-28", { Roneli: 180 }),
      day("2026-07-29", { Roneli: 190 }),
      day("2026-07-30", { Roneli: 200 }),
      day("2026-07-31", { Roneli: 210 }),
      day("2026-08-01", { Roneli: 220 }),
      day("2026-08-02", { Roneli: 230 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals[0]).toMatchObject({
      currentWeek: 1400,
      previousWeek: 910,
      windowDays: 7,
      currentPartial: false,
      missingToday: false,
      missingPrevDays: 0,
    });
    expect(totals[0].changePct).toBeCloseTo(53.8, 1);
  });

  it("returns a null change when the previous slice is outside the range", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-21", { Roneli: 110 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals[0].currentWeek).toBe(210);
    expect(totals[0].previousWeek).toBe(0);
    expect(totals[0].changePct).toBeNull();
    expect(totals[0].currentPartial).toBe(true);
    expect(totals[0].windowDays).toBe(2);
    expect(totals[0].missingToday).toBe(false);
    expect(totals[0].missingPrevDays).toBe(2);
  });

  it("treats a missing previous day as zero and counts it", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100 }),
      day("2026-07-27", { Roneli: 130 }),
      day("2026-07-28", { Roneli: 140 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals[0]).toMatchObject({
      currentWeek: 270,
      previousWeek: 100,
      changePct: 170,
      missingToday: false,
      missingPrevDays: 1,
    });
  });

  it("returns a null change when every previous day is missing", () => {
    const dailySales = [
      day("2026-07-27", { Roneli: 130 }),
      day("2026-07-28", { Roneli: 140 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals[0].currentWeek).toBe(270);
    expect(totals[0].previousWeek).toBe(0);
    expect(totals[0].changePct).toBeNull();
    expect(totals[0].missingPrevDays).toBe(2);
  });

  it("computes totals per branch", () => {
    const dailySales = [
      day("2026-07-20", { Roneli: 100, Saban: 50 }),
      day("2026-07-27", { Roneli: 130, Saban: 55 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.chickenByBranch);

    expect(totals).toHaveLength(2);
    const roneli = totals.find((t) => t.branch === "Roneli");
    const saban = totals.find((t) => t.branch === "Saban");
    expect(roneli).toMatchObject({ currentWeek: 130, previousWeek: 100 });
    expect(saban).toMatchObject({ currentWeek: 55, previousWeek: 50 });
  });

  it("uses the eggs source when the selector returns eggsByBranch", () => {
    const dailySales = [
      day("2026-07-20", {}, { Roneli: 10 }),
      day("2026-07-21", {}, { Roneli: 12 }),
      day("2026-07-27", {}, { Roneli: 15 }),
    ];

    const totals = computeWeekTotals(dailySales, (d) => d.eggsByBranch);

    expect(totals[0].currentWeek).toBe(15);
    expect(totals[0].previousWeek).toBe(10);
    expect(totals[0].changePct).toBe(50);
  });

  it("returns an empty array when dailySales is empty", () => {
    expect(computeWeekTotals([], (d) => d.chickenByBranch)).toEqual([]);
  });
});

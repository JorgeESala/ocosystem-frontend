import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatDayMonth,
  formatHumanDate,
  formatWeekdayDayMonth,
  getLastCompleteMonthRange,
  getMonthToDateRange,
  getPreviousComparisonRange,
} from "../date.utils";

describe("formatDayMonth", () => {
  it("formats the day without a leading zero", () => {
    expect(formatDayMonth("2026-06-08")).toBe("8 jun");
  });
});

describe("formatWeekdayDayMonth", () => {
  it("includes the weekday for chart axes", () => {
    expect(formatWeekdayDayMonth("2026-06-08")).toBe("lun 8 jun");
  });
});

describe("formatDateRange", () => {
  it("collapses a range inside the same month", () => {
    expect(formatDateRange(new Date(2026, 5, 8), new Date(2026, 5, 14))).toBe(
      "8 – 14 jun 2026",
    );
  });

  it("spans months within the same year", () => {
    expect(formatDateRange(new Date(2026, 5, 28), new Date(2026, 6, 3))).toBe(
      "28 jun – 3 jul 2026",
    );
  });

  it("spans different years", () => {
    expect(formatDateRange(new Date(2025, 11, 28), new Date(2026, 0, 3))).toBe(
      "28 dic 2025 – 3 ene 2026",
    );
  });
});

describe("formatHumanDate", () => {
  it("uses a numeric day in the short format", () => {
    expect(formatHumanDate("2026-06-08")).toBe("8 jun 2026");
  });
});

const expectRange = (
  range: { start: Date; end: Date },
  start: [number, number, number],
  end: [number, number, number],
) => {
  expect(range.start).toEqual(new Date(start[0], start[1], start[2]));
  expect(range.end).toEqual(new Date(end[0], end[1], end[2]));
};

describe("getMonthToDateRange", () => {
  it("returns the current month from day one through today", () => {
    expectRange(
      getMonthToDateRange(new Date(2026, 10, 11)),
      [2026, 10, 1],
      [2026, 10, 11],
    );
  });
});

describe("getPreviousComparisonRange", () => {
  it("uses the full previous month for a complete month", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 9, 1), new Date(2026, 9, 31)),
      [2026, 8, 1],
      [2026, 8, 30],
    );
  });

  it("keeps the same days for a partial month", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 10, 1), new Date(2026, 10, 11)),
      [2026, 9, 1],
      [2026, 9, 11],
    );
  });

  it("uses the complete previous month for February", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 1, 1), new Date(2026, 1, 28)),
      [2026, 0, 1],
      [2026, 0, 31],
    );
  });

  it("clamps a complete March to the last day of February", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 2, 1), new Date(2026, 2, 31)),
      [2026, 1, 1],
      [2026, 1, 28],
    );
  });

  it("shifts a two-month complete block back two months", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 8, 1), new Date(2026, 9, 31)),
      [2026, 6, 1],
      [2026, 7, 31],
    );
  });

  it("uses a non-overlapping equal-length window for an arbitrary range", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 9, 15), new Date(2026, 10, 15)),
      [2026, 8, 13],
      [2026, 9, 14],
    );
  });

  it("crosses into the previous year", () => {
    expectRange(
      getPreviousComparisonRange(new Date(2026, 0, 1), new Date(2026, 0, 31)),
      [2025, 11, 1],
      [2025, 11, 31],
    );
  });
});

describe("getLastCompleteMonthRange", () => {
  it("returns the previous full month", () => {
    expectRange(
      getLastCompleteMonthRange(new Date(2026, 10, 11)),
      [2026, 9, 1],
      [2026, 9, 31],
    );
  });

  it("crosses into the previous year", () => {
    expectRange(
      getLastCompleteMonthRange(new Date(2026, 0, 15)),
      [2025, 11, 1],
      [2025, 11, 31],
    );
  });
});

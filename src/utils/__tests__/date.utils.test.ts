import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatDayMonth,
  formatHumanDate,
  formatWeekdayDayMonth,
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

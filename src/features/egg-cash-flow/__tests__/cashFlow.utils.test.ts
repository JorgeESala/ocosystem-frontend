import { describe, expect, it } from "vitest";
import {
  currentWeekStart,
  formatDate,
  previousWeekRange,
} from "../utils/cashFlow.utils";

describe("formatDate", () => {
  it("formats an ISO date as short es-MX date", () => {
    expect(formatDate("2026-10-15")).toContain("15");
    expect(formatDate("2026-10-15")).toContain("2026");
  });
});

describe("currentWeekStart", () => {
  it("returns the Monday of the current week", () => {
    const monday = currentWeekStart();
    expect(monday.getDay()).toBe(1);
  });
});

describe("previousWeekRange", () => {
  it("returns the previous Monday through Sunday", () => {
    const { start, end } = previousWeekRange();
    expect(start.getDay()).toBe(1);
    expect(end.getDay()).toBe(0);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diff)).toBe(6);
    expect(start.getTime()).toBeLessThan(currentWeekStart().getTime());
  });
});

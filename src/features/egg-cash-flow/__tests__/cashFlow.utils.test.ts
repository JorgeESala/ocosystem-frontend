import { describe, expect, it } from "vitest";
import {
  currentWeekEnd,
  currentWeekStart,
  formatCurrency,
  lastNDays,
  toLocalDateString,
} from "../utils/cashFlow.utils";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    const result = formatCurrency(1500.5);
    expect(result).toContain("1,500.50");
    expect(result).toContain("$");
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-200);
    expect(result).toContain("200.00");
  });

  it("handles null and undefined", () => {
    expect(formatCurrency(null)).toBe("$0.00");
    expect(formatCurrency(undefined)).toBe("$0.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0.00");
  });
});

describe("toLocalDateString", () => {
  it("returns YYYY-MM-DD format", () => {
    const date = new Date(2026, 9, 15);
    expect(toLocalDateString(date)).toBe("2026-10-15");
  });

  it("pads single digit months and days", () => {
    const date = new Date(2026, 0, 5);
    expect(toLocalDateString(date)).toBe("2026-01-05");
  });
});

describe("currentWeekStart", () => {
  it("returns the Monday of the current week", () => {
    const monday = currentWeekStart();
    expect(monday.getDay()).toBe(1);
  });

  it("returns a date 6 days before currentWeekEnd", () => {
    const start = currentWeekStart();
    const end = currentWeekEnd();
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diff)).toBe(6);
  });
});

describe("lastNDays", () => {
  it("returns a range of n days", () => {
    const { start, end } = lastNDays(7);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diff)).toBe(7);
  });

  it("end is today", () => {
    const { end } = lastNDays(30);
    const today = new Date();
    expect(end.getFullYear()).toBe(today.getFullYear());
    expect(end.getMonth()).toBe(today.getMonth());
    expect(end.getDate()).toBe(today.getDate());
  });
});

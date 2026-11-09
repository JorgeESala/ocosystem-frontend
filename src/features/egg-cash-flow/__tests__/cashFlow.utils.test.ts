import { describe, expect, it } from "vitest";
import {
  accountLabel,
  accountLabelShort,
  currentWeekStart,
  formatDate,
  latestFridayWeekRange,
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

describe("latestFridayWeekRange", () => {
  it("returns the Saturday through Friday week that just closed", () => {
    const { start, end } = latestFridayWeekRange(new Date(2026, 10, 9));
    expect(start.getDay()).toBe(6);
    expect(end.getDay()).toBe(5);
    expect(start.getDate()).toBe(31);
    expect(end.getDate()).toBe(6);
    expect(end.getMonth()).toBe(10);
  });

  it("keeps today when the reference is Friday", () => {
    const { end } = latestFridayWeekRange(new Date(2026, 10, 6));
    expect(end.getDate()).toBe(6);
  });
});

describe("accountLabel", () => {
  it("uses the configured account holder name", () => {
    expect(accountLabel("Enrique")).toBe("la cuenta de Enrique");
    expect(accountLabelShort("Enrique")).toBe("Cuenta de Enrique");
  });

  it("falls back to the generic account label", () => {
    expect(accountLabel("Titular")).toBe("la cuenta del titular");
    expect(accountLabel("")).toBe("la cuenta del titular");
    expect(accountLabel(null)).toBe("la cuenta del titular");
    expect(accountLabelShort(undefined)).toBe("Cuenta del titular");
  });
});

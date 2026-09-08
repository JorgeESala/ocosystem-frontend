import { describe, expect, it } from "vitest";
import { getAgingBucket, getAgingDays } from "./aging";

describe("aging", () => {
  it("computes days since date", () => {
    const now = new Date("2026-09-03T12:00:00Z").getTime();
    expect(getAgingDays("2026-09-01", now)).toBe(3);
    expect(getAgingDays("invalid", now)).toBe(0);
  });

  it("buckets correctly", () => {
    expect(getAgingBucket(0)).toBe("0-7");
    expect(getAgingBucket(7)).toBe("0-7");
    expect(getAgingBucket(8)).toBe("8-14");
    expect(getAgingBucket(15)).toBe("15-30");
    expect(getAgingBucket(31)).toBe("30+");
  });
});

import { describe, expect, it } from "vitest";
import { buildWeekdayAverages, heatIntensity } from "../utils/productMetrics";

describe("buildWeekdayAverages", () => {
  it("averages quantity per weekday over observed days", () => {
    const rows = buildWeekdayAverages([
      {
        day: "2026-06-01",
        quantity: 10,
        sales: 100,
        cancelledQuantity: 0,
        cancelledSubtotal: 0,
      },
      {
        day: "2026-06-08",
        quantity: 20,
        sales: 200,
        cancelledQuantity: 0,
        cancelledSubtotal: 0,
      },
      {
        day: "2026-06-02",
        quantity: 5,
        sales: 50,
        cancelledQuantity: 0,
        cancelledSubtotal: 0,
      },
    ]);

    const monday = rows.find((row) => row.key === "L");
    const tuesday = rows.find((row) => row.key === "M");
    const sunday = rows.find((row) => row.key === "D");

    expect(monday?.avg).toBe(15);
    expect(monday?.days).toBe(2);
    expect(tuesday?.avg).toBe(5);
    expect(sunday?.avg).toBe(0);
    expect(sunday?.days).toBe(0);
  });
});

describe("heatIntensity", () => {
  it("scales between zero and one", () => {
    expect(heatIntensity(0, 100)).toBe(0);
    expect(heatIntensity(50, 100)).toBe(0.5);
    expect(heatIntensity(200, 100)).toBe(1);
    expect(heatIntensity(10, 0)).toBe(0);
    expect(heatIntensity(-5, 100)).toBe(0);
  });
});

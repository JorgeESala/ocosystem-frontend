import { describe, expect, it } from "vitest";
import { buildDeliverySummary } from "../utils/deliverySummary";
import type { OrderPredictionDTO, PredictionPeriodDTO } from "../types";

const period = (
  overrides: Partial<PredictionPeriodDTO> = {},
): PredictionPeriodDTO => ({
  deliveryDay: "Lunes",
  deliveryDate: "2026-10-05",
  endDate: "2026-10-11",
  chicken: 0,
  eggs: 0,
  interpolated: false,
  dailyBreakdown: [],
  ...overrides,
});

const prediction = (
  overrides: Partial<OrderPredictionDTO> = {},
): OrderPredictionDTO => ({
  branchId: 1,
  branchName: "Norte",
  deliveryDays: [1],
  eggDeliveryDays: [],
  chickenPeriods: [],
  eggPeriods: [],
  totalChicken: 0,
  totalEggs: 0,
  ...overrides,
});

describe("buildDeliverySummary", () => {
  it("totals weekly chicken and eggs across branches", () => {
    const summary = buildDeliverySummary([
      prediction({ totalChicken: 120, totalEggs: 40 }),
      prediction({ branchId: 2, branchName: "Sur", totalChicken: 80 }),
    ]);

    expect(summary.totalChicken).toBe(200);
    expect(summary.totalEggs).toBe(40);
    expect(summary.branchCount).toBe(2);
  });

  it("merges chicken and egg for the same branch and date", () => {
    const summary = buildDeliverySummary([
      prediction({
        chickenPeriods: [period({ deliveryDate: "2026-10-05", chicken: 120 })],
        eggPeriods: [
          period({ deliveryDate: "2026-10-05", eggs: 40 }),
          period({
            deliveryDay: "Jueves",
            deliveryDate: "2026-10-08",
            eggs: 30,
          }),
        ],
      }),
    ]);

    expect(summary.upcoming).toHaveLength(2);
    expect(summary.upcoming[0]).toMatchObject({
      branchName: "Norte",
      deliveryDate: "2026-10-05",
      chicken: 120,
      eggs: 40,
    });
  });

  it("sorts upcoming deliveries by date and caps at three", () => {
    const summary = buildDeliverySummary([
      prediction({
        chickenPeriods: [
          period({
            deliveryDay: "Jueves",
            deliveryDate: "2026-10-08",
            chicken: 50,
          }),
          period({
            deliveryDay: "Lunes",
            deliveryDate: "2026-10-05",
            chicken: 120,
          }),
          period({
            deliveryDay: "Sábado",
            deliveryDate: "2026-10-10",
            chicken: 30,
          }),
          period({
            deliveryDay: "Domingo",
            deliveryDate: "2026-10-11",
            chicken: 10,
          }),
        ],
      }),
    ]);

    expect(summary.upcoming.map((entry) => entry.deliveryDate)).toEqual([
      "2026-10-05",
      "2026-10-08",
      "2026-10-10",
    ]);
  });

  it("returns an empty summary without predictions", () => {
    const summary = buildDeliverySummary([]);

    expect(summary.totalChicken).toBe(0);
    expect(summary.totalEggs).toBe(0);
    expect(summary.branchCount).toBe(0);
    expect(summary.upcoming).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { buildTripGroups, PICKUP_GROUP_KEY } from "./tripGrouping";

const sale = (overrides: Record<string, unknown> = {}) => ({
  id: Math.floor(Math.random() * 100000),
  type: "SALE" as const,
  date: "2026-09-10",
  employeeId: 5,
  employeeName: "Chofer A",
  routeId: 2,
  routeName: "Ruta 2",
  weight: 100,
  kgSent: 102,
  quantity: 40,
  saleTotal: 2000,
  ...overrides,
});

describe("buildTripGroups - recogida en CEDIS", () => {
  it("agrupa las ventas sin chofer en la sección de recogida", () => {
    const groups = buildTripGroups([
      sale({ id: 1 }),
      sale({ id: 2, employeeId: null, routeId: null }),
      sale({ id: 3, employeeId: null, routeId: null }),
    ]);

    const pickup = groups.find((g) => g.key === PICKUP_GROUP_KEY);
    expect(pickup).toBeDefined();
    expect(pickup?.movements.map((m) => m.id).sort()).toEqual([2, 3]);
    expect(pickup?.totals.salesCount).toBe(2);
    expect(pickup?.totals.kgSold).toBe(200);
  });

  it("no crea la sección de recogida cuando todas las ventas tienen chofer", () => {
    const groups = buildTripGroups([sale({ id: 1 })]);
    expect(groups.find((g) => g.key === PICKUP_GROUP_KEY)).toBeUndefined();
  });
});

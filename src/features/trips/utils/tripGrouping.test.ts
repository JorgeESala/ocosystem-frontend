import { describe, expect, it } from "vitest";
import {
  buildTripGroups,
  splitMovementsByClientType,
  PICKUP_GROUP_KEY,
  type InlineMovement,
} from "./tripGrouping";
import type { TripSummaryDTO } from "../types/trip.types";

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

const trip = (
  id: number,
  overrides: Partial<TripSummaryDTO> = {},
): TripSummaryDTO => ({
  id,
  driverId: 5,
  driverName: "Chofer A",
  vehicleId: null,
  vehicleName: null,
  routeId: 2,
  routeName: "Ruta 2",
  departureDate: "2026-09-10",
  totalKgLoaded: null,
  totalKgReturned: null,
  batchSources: [],
  salesCount: 2,
  totalSaleAmount: 0,
  totalQuantity: 0,
  totalWeight: 0,
  totalKgSent: 0,
  ...overrides,
});

describe("buildTripGroups - viajes", () => {
  it("separa dos viajes del mismo chofer y fecha", () => {
    const groups = buildTripGroups(
      [
        sale({ id: 1, tripId: 10 }),
        sale({ id: 2, tripId: 11, routeId: 3, routeName: "Ruta 3" }),
      ],
      [trip(10), trip(11, { routeId: 3, routeName: "Ruta 3" })],
    );

    const tripGroups = groups.filter((group) => group.trip != null);
    expect(tripGroups).toHaveLength(2);
    expect(tripGroups.map((group) => group.tripId).sort()).toEqual([10, 11]);
  });

  it("no mezcla ventas de otro viaje del mismo chofer y fecha", () => {
    const groups = buildTripGroups(
      [
        sale({ id: 1, tripId: 10, batchId: 1 }),
        sale({ id: 2, tripId: 11, batchId: 2 }),
      ],
      [trip(10), trip(11)],
    );

    const firstTrip = groups.find((group) => group.tripId === 10);
    const secondTrip = groups.find((group) => group.tripId === 11);

    expect(firstTrip?.movements.map((movement) => movement.id)).toEqual([1]);
    expect(secondTrip?.movements.map((movement) => movement.id)).toEqual([2]);
  });

  it("mantiene visible un viaje con una sola venta", () => {
    const groups = buildTripGroups(
      [sale({ id: 1, tripId: 10 })],
      [trip(10, { salesCount: 1 })],
    );

    const firstTrip = groups.find((group) => group.tripId === 10);
    expect(firstTrip).toBeDefined();
    expect(firstTrip?.isSingleSale).not.toBe(true);
  });

  it("mantiene las ventas sin viaje fuera de los viajes", () => {
    const groups = buildTripGroups(
      [sale({ id: 1, tripId: 10 }), sale({ id: 2, tripId: null })],
      [trip(10)],
    );

    const tripGroup = groups.find((group) => group.tripId === 10);
    expect(tripGroup?.movements.map((movement) => movement.id)).toEqual([1]);

    const withoutTrip = groups.find(
      (group) => group.trip == null && group.movements.length === 1,
    );
    expect(withoutTrip?.movements[0].id).toBe(2);
  });
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

describe("splitMovementsByClientType", () => {
  const base = {
    type: "SALE" as const,
    date: "2026-01-15",
    employeeId: 27,
  };

  const internalSale: InlineMovement = {
    ...base,
    id: 1,
    clientId: 10,
    internalClient: true,
    quantity: 360,
    weight: 20,
    kgSent: 22,
    saleTotal: 1800,
  };

  const externalSale: InlineMovement = {
    ...base,
    id: 2,
    clientId: 11,
    internalClient: false,
    quantity: 180,
    weight: 10,
    kgSent: 11,
    saleTotal: 900,
  };

  const saleWithoutClient: InlineMovement = {
    ...base,
    id: 3,
    quantity: 30,
    weight: 2,
    kgSent: 2,
    saleTotal: 150,
  };

  it("separates internal and external sales", () => {
    const split = splitMovementsByClientType([internalSale, externalSale]);

    expect(split.internal).toHaveLength(1);
    expect(split.internal[0].id).toBe(1);
    expect(split.external).toHaveLength(1);
    expect(split.external[0].id).toBe(2);
  });

  it("treats sales without a client as external", () => {
    const split = splitMovementsByClientType([saleWithoutClient]);

    expect(split.internal).toHaveLength(0);
    expect(split.external).toHaveLength(1);
    expect(split.external[0].id).toBe(3);
  });

  it("computes per-group totals", () => {
    const split = splitMovementsByClientType([
      internalSale,
      externalSale,
      saleWithoutClient,
    ]);

    expect(split.internalTotals).toEqual({
      kgSold: 20,
      kgSent: 22,
      totalPieces: 360,
      saleTotal: 1800,
      salesCount: 1,
    });
    expect(split.externalTotals).toEqual({
      kgSold: 12,
      kgSent: 13,
      totalPieces: 210,
      saleTotal: 1050,
      salesCount: 2,
    });
  });

  it("handles empty movement list", () => {
    const split = splitMovementsByClientType([]);

    expect(split.internal).toHaveLength(0);
    expect(split.external).toHaveLength(0);
    expect(split.internalTotals.salesCount).toBe(0);
    expect(split.externalTotals.saleTotal).toBe(0);
  });

  it("treats adjustments as external", () => {
    const adjustment: InlineMovement = {
      id: 4,
      type: "ADJUSTMENT",
      date: "2026-01-15",
      internalClient: true,
      quantity: 10,
      weight: 1,
    };

    const split = splitMovementsByClientType([adjustment]);

    expect(split.internal).toHaveLength(0);
    expect(split.external).toHaveLength(1);
  });

  it("missing internalClient flag defaults to external", () => {
    const legacy: InlineMovement = {
      ...base,
      id: 5,
      clientId: 12,
      quantity: 360,
      saleTotal: 1800,
    };

    const split = splitMovementsByClientType([legacy]);

    expect(split.internal).toHaveLength(0);
    expect(split.external).toHaveLength(1);
  });
});

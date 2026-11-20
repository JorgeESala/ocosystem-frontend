import type { TripSaleDTO, TripSummaryDTO } from "../types/trip.types";

export interface InlineMovement {
  id: number;
  type: "SALE" | "ADJUSTMENT";
  date: string;
  employeeId?: number;
  employeeName?: string | null;
  routeId?: number;
  routeName?: string | null;
  tripId?: number | null;
  batchId?: number | null;
  batchLabel?: string | null;
  kgSent?: number | null;
  weight?: number | null;
  quantity?: number | null;
  saleTotal?: number | null;
  clientId?: number | null;
  clientName?: string | null;
  internalClient?: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TripGroup {
  key: string;
  tripId?: number | null;
  driverId: number | null;
  driverName: string | null;
  routeId: number | null;
  routeName: string | null;
  date: string;
  trip: TripSummaryDTO | null;
  movements: InlineMovement[];
  totals: {
    kgSold: number;
    kgSent: number;
    totalPieces: number;
    saleTotal: number;
    salesCount: number;
  };
  isSingleSale?: boolean;
}

export const PICKUP_GROUP_KEY = "__pickup__";

const safeNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const emptyTotals = (): TripGroup["totals"] => ({
  kgSold: 0,
  kgSent: 0,
  totalPieces: 0,
  saleTotal: 0,
  salesCount: 0,
});

function accumulateTotals(
  movements: InlineMovement[],
  into: TripGroup["totals"] = emptyTotals(),
): TripGroup["totals"] {
  for (const m of movements) {
    into.kgSold += safeNumber(m.weight);
    into.kgSent += safeNumber(m.kgSent);
    into.totalPieces += safeNumber(m.quantity);
    into.saleTotal += safeNumber(m.saleTotal);
    into.salesCount += 1;
  }
  return into;
}

export interface ClientTypeSplit {
  internal: InlineMovement[];
  external: InlineMovement[];
  internalTotals: TripGroup["totals"];
  externalTotals: TripGroup["totals"];
}

export function splitMovementsByClientType(
  movements: InlineMovement[],
): ClientTypeSplit {
  const internal: InlineMovement[] = [];
  const external: InlineMovement[] = [];
  for (const m of movements) {
    if (m.type === "SALE" && m.internalClient === true) {
      internal.push(m);
    } else {
      external.push(m);
    }
  }
  return {
    internal,
    external,
    internalTotals: accumulateTotals(internal),
    externalTotals: accumulateTotals(external),
  };
}

const dateOnly = (input: string) => {
  if (!input) return "";
  if (input.length >= 10) return input.substring(0, 10);
  return input;
};

const addMovement = (group: TripGroup, movement: InlineMovement) => {
  group.movements.push(movement);
  group.totals.kgSold += safeNumber(movement.weight);
  group.totals.kgSent += safeNumber(movement.kgSent);
  group.totals.totalPieces += safeNumber(movement.quantity);
  group.totals.saleTotal += safeNumber(movement.saleTotal);
  group.totals.salesCount += 1;
};

export function buildTripGroups(
  movements: InlineMovement[],
  trips: TripSummaryDTO[] = [],
): TripGroup[] {
  const sales = movements.filter((m) => m.type === "SALE");
  const adjustments = movements.filter((m) => m.type !== "SALE");
  const pickupSales = sales.filter((m) => m.employeeId == null);
  const routedSales = sales.filter((m) => m.employeeId != null);

  const tripById = new Map<number, TripSummaryDTO>();
  for (const trip of trips) {
    tripById.set(trip.id, trip);
  }

  const groupMap = new Map<string, TripGroup>();

  const tripGroup = (
    tripId: number,
    fallback?: InlineMovement,
  ): TripGroup => {
    const key = `trip-${tripId}`;
    const existing = groupMap.get(key);
    if (existing) return existing;

    const trip = tripById.get(tripId) ?? null;
    const group: TripGroup = {
      key,
      tripId,
      driverId: trip?.driverId ?? fallback?.employeeId ?? null,
      driverName: trip?.driverName ?? fallback?.employeeName ?? null,
      routeId: trip?.routeId ?? fallback?.routeId ?? null,
      routeName: trip?.routeName ?? fallback?.routeName ?? null,
      date: dateOnly(trip?.departureDate ?? fallback?.date ?? ""),
      trip,
      movements: [],
      totals: emptyTotals(),
    };
    groupMap.set(key, group);
    return group;
  };

  for (const movement of routedSales) {
    if (movement.tripId != null) {
      addMovement(tripGroup(movement.tripId, movement), movement);
      continue;
    }

    const key = `untripped-${movement.employeeId ?? "_"}|${dateOnly(movement.date)}`;
    let group = groupMap.get(key);
    if (!group) {
      group = {
        key,
        driverId: movement.employeeId ?? null,
        driverName: movement.employeeName ?? null,
        routeId: movement.routeId ?? null,
        routeName: movement.routeName ?? null,
        date: dateOnly(movement.date),
        trip: null,
        movements: [],
        totals: emptyTotals(),
      };
      groupMap.set(key, group);
    }
    addMovement(group, movement);
  }

  for (const trip of trips) {
    tripGroup(trip.id);
  }

  const groups = Array.from(groupMap.values());
  groups.sort((left, right) => {
    if (left.date !== right.date) {
      return left.date < right.date ? 1 : -1;
    }
    return (right.trip?.id ?? 0) - (left.trip?.id ?? 0);
  });

  const finalList: TripGroup[] = [...groups];

  if (pickupSales.length > 0) {
    const sortedPickup = [...pickupSales].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
    );
    finalList.push({
      key: PICKUP_GROUP_KEY,
      driverId: null,
      driverName: null,
      routeId: null,
      routeName: null,
      date: "",
      trip: null,
      movements: sortedPickup,
      totals: accumulateTotals(sortedPickup),
    });
  }

  for (const group of finalList) {
    if (
      !group.key.startsWith("__") &&
      group.trip == null &&
      group.movements.length === 1
    ) {
      group.isSingleSale = true;
    }
  }

  finalList.push({
    key: "__adjustments__",
    driverId: null,
    driverName: null,
    routeId: null,
    routeName: null,
    date: "",
    trip: null,
    movements: adjustments,
    totals: emptyTotals(),
  });

  return finalList;
}

export function saleIsFromOtherBatch(
  sale: TripSaleDTO | InlineMovement,
  currentBatchId: number,
): boolean {
  const saleBatchId = (sale as TripSaleDTO).batchId;
  if (saleBatchId == null) return false;
  return saleBatchId !== currentBatchId;
}

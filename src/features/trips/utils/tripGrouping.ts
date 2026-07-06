import type { TripSaleDTO, TripSummaryDTO } from "../types/trip.types";

export interface InlineMovement {
  id: number;
  type: "SALE" | "ADJUSTMENT";
  date: string;
  employeeId?: number;
  employeeName?: string | null;
  routeId?: number;
  routeName?: string | null;
  kgSent?: number;
  weight?: number;
  quantity?: number;
  saleTotal?: number;
  clientId?: number;
  reason?: string;
  [key: string]: unknown;
}

export interface TripGroup {
  key: string;
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

const safeNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const groupKey = (driverId: number | null, date: string) =>
  `${driverId ?? "_"}|${date}`;

const dateOnly = (input: string) => {
  if (!input) return "";
  if (input.length >= 10) return input.substring(0, 10);
  return input;
};

export function buildTripGroups(
  movements: InlineMovement[],
  trips: TripSummaryDTO[] = [],
): TripGroup[] {
  const sales = movements.filter((m) => m.type === "SALE");
  const adjustments = movements.filter((m) => m.type !== "SALE");

  const tripIndexByKey = new Map<string, TripSummaryDTO>();
  for (const t of trips) {
    tripIndexByKey.set(
      groupKey(t.driverId, dateOnly(t.departureDate)),
      t,
    );
  }

  const groupMap = new Map<string, TripGroup>();
  for (const m of sales) {
    const d = dateOnly(m.date);
    const key = groupKey(m.employeeId ?? null, d);
    let group = groupMap.get(key);
    if (!group) {
      const trip = tripIndexByKey.get(key) ?? null;
      group = {
        key,
        driverId: m.employeeId ?? null,
        driverName: m.employeeName ?? trip?.driverName ?? null,
        routeId: m.routeId ?? null,
        routeName: m.routeName ?? trip?.routeName ?? null,
        date: d,
        trip,
        movements: [],
        totals: {
          kgSold: 0,
          kgSent: 0,
          totalPieces: 0,
          saleTotal: 0,
          salesCount: 0,
        },
      };
      groupMap.set(key, group);
    }
    group.movements.push(m);
    group.totals.kgSold += safeNumber(m.weight);
    group.totals.kgSent += safeNumber(m.kgSent);
    group.totals.totalPieces += safeNumber(m.quantity);
    group.totals.saleTotal += safeNumber(m.saleTotal);
    group.totals.salesCount += 1;
  }

  const orphanSales: InlineMovement[] = [];
  for (const m of sales) {
    const d = dateOnly(m.date);
    const key = groupKey(m.employeeId ?? null, d);
    if (!groupMap.has(key)) {
      orphanSales.push(m);
    }
  }

  for (const t of trips) {
    const key = groupKey(t.driverId, dateOnly(t.departureDate));
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        driverId: t.driverId,
        driverName: t.driverName ?? null,
        routeId: t.routeId,
        routeName: t.routeName ?? null,
        date: dateOnly(t.departureDate),
        trip: t,
        movements: [],
        totals: {
          kgSold: 0,
          kgSent: 0,
          totalPieces: 0,
          saleTotal: 0,
          salesCount: 0,
        },
      });
    }
  }

  const groups = Array.from(groupMap.values());
  groups.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const orphans: TripGroup = {
    key: "__orphan_sales__",
    driverId: null,
    driverName: null,
    routeId: null,
    routeName: null,
    date: "",
    trip: null,
    movements: orphanSales,
    totals: orphanSales.reduce(
      (acc, m) => {
        acc.kgSold += safeNumber(m.weight);
        acc.kgSent += safeNumber(m.kgSent);
        acc.totalPieces += safeNumber(m.quantity);
        acc.saleTotal += safeNumber(m.saleTotal);
        acc.salesCount += 1;
        return acc;
      },
      {
        kgSold: 0,
        kgSent: 0,
        totalPieces: 0,
        saleTotal: 0,
        salesCount: 0,
      },
    ),
  };

  const finalList: TripGroup[] = [...groups];

  for (const group of finalList) {
    if (
      !group.key.startsWith("__") &&
      group.movements.length === 1 &&
      (group.trip == null || group.trip.salesCount === 1)
    ) {
      group.isSingleSale = true;
    }
  }

  if (orphans.movements.length > 0) {
    finalList.push(orphans);
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
    totals: {
      kgSold: 0,
      kgSent: 0,
      totalPieces: 0,
      saleTotal: 0,
      salesCount: 0,
    },
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

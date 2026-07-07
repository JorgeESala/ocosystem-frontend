import type { TripsUnitType } from "../types/trip.types";

export const tripKeys = (unitType: TripsUnitType) => ({
  all: ["trips", unitType] as const,
  byBatch: (batchId: number) =>
    [...tripKeys(unitType).all, "by-batch", batchId] as const,
  sales: (id: number) => [...tripKeys(unitType).all, "detail", id, "sales"] as const,
  salesByDriverDate: (driverId: number, date: string) =>
    [...tripKeys(unitType).all, "by-driver-date", driverId, date] as const,
});

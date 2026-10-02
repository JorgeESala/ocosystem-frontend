import type { OrderPredictionDTO } from "../types";

export interface UpcomingDelivery {
  branchId: number;
  branchName: string;
  deliveryDate: string;
  deliveryDay: string;
  chicken: number;
  eggs: number;
  interpolated: boolean;
}

export interface DeliverySummary {
  totalChicken: number;
  totalEggs: number;
  branchCount: number;
  upcoming: UpcomingDelivery[];
}

export const MAX_PREVIEW_DELIVERIES = 3;

export const buildDeliverySummary = (
  predictions: OrderPredictionDTO[],
  limit: number = MAX_PREVIEW_DELIVERIES,
): DeliverySummary => {
  const totalChicken = predictions.reduce(
    (sum, prediction) => sum + prediction.totalChicken,
    0,
  );
  const totalEggs = predictions.reduce(
    (sum, prediction) => sum + prediction.totalEggs,
    0,
  );

  const byBranchAndDate = new Map<string, UpcomingDelivery>();

  const add = (
    branchId: number,
    branchName: string,
    deliveryDate: string,
    deliveryDay: string,
    chicken: number,
    eggs: number,
    interpolated: boolean,
  ) => {
    const key = `${branchId}|${deliveryDate}`;
    const existing = byBranchAndDate.get(key);
    if (existing) {
      existing.chicken += chicken;
      existing.eggs += eggs;
      existing.interpolated = existing.interpolated || interpolated;
      return;
    }
    byBranchAndDate.set(key, {
      branchId,
      branchName,
      deliveryDate,
      deliveryDay,
      chicken,
      eggs,
      interpolated,
    });
  };

  for (const prediction of predictions) {
    for (const chickenPeriod of prediction.chickenPeriods ?? []) {
      add(
        prediction.branchId,
        prediction.branchName,
        chickenPeriod.deliveryDate,
        chickenPeriod.deliveryDay,
        chickenPeriod.chicken,
        0,
        chickenPeriod.interpolated,
      );
    }
    for (const eggPeriod of prediction.eggPeriods ?? []) {
      add(
        prediction.branchId,
        prediction.branchName,
        eggPeriod.deliveryDate,
        eggPeriod.deliveryDay,
        0,
        eggPeriod.eggs,
        eggPeriod.interpolated,
      );
    }
  }

  const upcoming = [...byBranchAndDate.values()]
    .sort((a, b) => (a.deliveryDate < b.deliveryDate ? -1 : 1))
    .slice(0, limit);

  return {
    totalChicken,
    totalEggs,
    branchCount: predictions.length,
    upcoming,
  };
};

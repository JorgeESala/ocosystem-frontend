export interface DeliveryScheduleDTO {
  branchId: number;
  branchName: string;
  deliveryDays: number[];
  eggDeliveryDays: number[];
}

export interface UpdateDeliveryScheduleDTO {
  deliveryDays: number[];
  eggDeliveryDays: number[];
}

export interface DailyBreakdownDTO {
  dayName: string;
  date: string;
  average: number;
  previous: number;
  interpolated: boolean;
}

export interface PredictionPeriodDTO {
  deliveryDay: string;
  deliveryDate: string;
  endDate: string;
  chicken: number;
  eggs: number;
  interpolated: boolean;
  dailyBreakdown: DailyBreakdownDTO[];
}

export interface OrderPredictionDTO {
  branchId: number;
  branchName: string;
  deliveryDays: number[];
  eggDeliveryDays: number[];
  chickenPeriods: PredictionPeriodDTO[];
  eggPeriods: PredictionPeriodDTO[];
  totalChicken: number;
  totalEggs: number;
}

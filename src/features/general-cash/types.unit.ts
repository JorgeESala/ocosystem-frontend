export type UnitCashUnit = "EGG" | "LIVE_CHICKEN";

export interface UnitCashAccountDTO {
  id: number;
  startingBalance: number;
  currentBalance: number;
  alertThreshold: number;
  lastCalculatedAt: string | null;
}

export interface UnitCashFlowPointDTO {
  period: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

export interface UnitCashFlowSummaryDTO {
  totalIngresos: number;
  totalGastos: number;
  totalNeto: number;
  currentBalance: number;
}

export interface UnitCashFlowResponseDTO {
  startDate: string;
  endDate: string;
  frequency: string;
  points: UnitCashFlowPointDTO[];
  summary: UnitCashFlowSummaryDTO;
}

export interface UnitCashAlertDTO {
  type: "LOW_BALANCE" | "NEGATIVE_BALANCE";
  severity: "critical" | "warning";
  message: string;
  currentBalance: number;
  threshold: number;
}

export interface UnitCashHistoryDTO {
  id: number;
  entryDate: string;
  entryType: string;
  amount: number;
  sourceType: string | null;
  sourceId: number | null;
  description: string | null;
  runningBalance: number;
  createdAt: string;
}

export interface UnitCashAdjustmentDTO {
  id: number;
  amount: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface CreateUnitCashAdjustmentDTO {
  amount: number;
  reason: string;
  date: string;
}

export interface UpdateUnitCashAdjustmentDTO {
  amount: number;
  reason: string;
  date: string;
}

export interface CreateUnitCashDTO {
  startingBalance: number;
  alertThreshold: number;
}

export interface UpdateUnitCashDTO {
  startingBalance: number;
  alertThreshold: number;
}

export type UnitCashFrequency = "daily" | "weekly" | "monthly";

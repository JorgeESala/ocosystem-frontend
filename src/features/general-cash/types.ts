export interface CashReserveResponseDTO {
  id: number;
  branchId: number;
  branchName: string;
  startingBalance: number;
  currentBalance: number;
  alertThreshold: number;
  lastCalculatedAt: string | null;
}

export interface CashFlowPointDTO {
  period: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

export interface CashFlowSummaryDTO {
  totalIngresos: number;
  totalGastos: number;
  totalNeto: number;
  currentBalance: number;
}

export interface CashFlowResponseDTO {
  reserveId: number;
  branchName: string;
  startDate: string;
  endDate: string;
  frequency: string;
  points: CashFlowPointDTO[];
  summary: CashFlowSummaryDTO;
}

export interface CashReserveAlertDTO {
  branchId: number;
  branchName: string;
  type:
    | "LOW_BALANCE"
    | "NEGATIVE_BALANCE"
    | "NEGATIVE_FLOW"
    | "DECLINING_TREND";
  severity: "critical" | "warning";
  message: string;
  currentBalance: number;
  threshold: number;
}

export interface CreateCashReserveDTO {
  branchId: number;
  startingBalance: number;
  alertThreshold: number;
}

export interface UpdateCashReserveDTO {
  startingBalance: number;
  alertThreshold: number;
}

export type CashFlowFrequency = "daily" | "weekly" | "monthly";

export interface CashFlowHistoryDTO {
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

export interface CashAdjustmentDTO {
  id: number;
  branchId: number;
  branchName: string;
  amount: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface CreateCashAdjustmentDTO {
  branchId: number;
  amount: number;
  reason: string;
  date: string;
}

export interface UpdateCashAdjustmentDTO {
  amount: number;
  reason: string;
  date: string;
}

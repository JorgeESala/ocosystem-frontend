export type UnitCashUnit = "EGG" | "LIVE_CHICKEN";

export interface UnitCashAccountDTO {
  id: number;
  startingBalance: number;
  currentBalance: number;
  alertThreshold: number;
  lastCalculatedAt: string | null;
  updatedBy: number | null;
  lastReconciledAt: string | null;
  trackingStartDate: string;
  lastCutDate: string | null;
  lastCutOpeningBalance: number | null;
}

export interface UnitCashCutDTO {
  id: number;
  cutDate: string;
  closingBalance: number;
  openingBalance: number;
  alertThreshold: number;
  note: string | null;
  handedOverBy: number;
  receivedBy: number;
  createdBy: number | null;
  createdAt: string;
}

export interface CreateUnitCashCutDTO {
  cutDate: string;
  openingBalance: number;
  alertThreshold: number;
  note: string | null;
  handedOverBy: number;
  receivedBy: number;
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
  createdBy: number | null;
}

export interface UnitCashAdjustmentDTO {
  id: number;
  amount: number;
  reason: string;
  date: string;
  createdAt: string;
  createdBy: number | null;
  updatedBy: number | null;
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

export type ReconciliationChangeType = "CREATE" | "UPDATE" | "DELETE";

export interface UnitCashReconciliationChangeDTO {
  changeType: ReconciliationChangeType;
  sourceType: string;
  sourceId: number;
  folio: string | null;
  entryDate: string;
  entryType: string;
  amount: number;
  previousAmount: number | null;
  description: string | null;
  reason: string;
  balanceDelta: number;
}

export interface UnitCashReconciliationPlanDTO {
  from: string;
  to: string;
  changes: UnitCashReconciliationChangeDTO[];
  created: number;
  updated: number;
  deleted: number;
  previousBalance: number | null;
  projectedBalance: number | null;
  lastReconciledAt: string | null;
}

export interface UnitCashReconciliationSummaryDTO {
  from: string;
  to: string;
  created: number;
  updated: number;
  deleted: number;
  previousBalance: number;
  currentBalance: number;
  lastReconciledAt: string | null;
}

export type CashFlowAccount = "CASH" | "BANK";
export type CashFlowDirection = "IN" | "OUT";

export type CashFlowCategory =
  | "TRIP_COLLECTION"
  | "PAYMENT_COLLECTION"
  | "CLIENT_COLLECTION"
  | "OTHER_INCOME"
  | "CASH_EXPENSE"
  | "DEPOSIT"
  | "REMESA_PAYMENT"
  | "ADJUSTMENT";

export type CashFlowSourceType =
  | "TRIP"
  | "PAYMENT"
  | "CLIENT"
  | "EXPENSE"
  | "ACCOUNTS_PAYABLE"
  | "OTHER";

export interface CashFlowSettings {
  id: number;
  cashOpeningBalance: number;
  bankOpeningBalance: number;
  accountHolder: string;
  trackingStartDate: string;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: number | null;
}

export interface CreateCashFlowSettingsDTO {
  cashOpeningBalance: number;
  bankOpeningBalance: number;
  accountHolder: string;
  trackingStartDate: string;
}

export interface UpdateCashFlowSettingsDTO {
  cashOpeningBalance: number;
  bankOpeningBalance: number;
  accountHolder: string;
  trackingStartDate: string;
}

export interface CashFlowMovement {
  id: number;
  movementDate: string;
  account: CashFlowAccount;
  direction: CashFlowDirection;
  category: CashFlowCategory;
  amount: number;
  transferGroupId: string | null;
  sourceType: CashFlowSourceType | null;
  sourceId: number | null;
  folio: string | null;
  description: string | null;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
}

export interface CreateIncomeRequestDTO {
  date: string;
  amount: number;
  tripId?: number | null;
  paymentId?: number | null;
  clientId?: number | null;
  folio?: string | null;
  description?: string | null;
  note?: string | null;
}

export interface CreateDepositRequestDTO {
  date: string;
  amount: number;
  folio?: string | null;
  note?: string | null;
}

export interface CreateCashExpenseRequestDTO {
  expenseId: number;
  date?: string | null;
  amount?: number | null;
  note?: string | null;
}

export interface CreateRemesaPaymentRequestDTO {
  accountsPayableId: number;
  account: CashFlowAccount;
  date: string;
  amount: number;
  folio?: string | null;
  note?: string | null;
}

export interface CreateAdjustmentRequestDTO {
  account: CashFlowAccount;
  direction: CashFlowDirection;
  date: string;
  amount: number;
  reason: string;
  note?: string | null;
}

export interface CashFlowSummary {
  from: string;
  to: string;
  cashOpeningBalance: number;
  cashClosingBalance: number;
  bankOpeningBalance: number;
  bankClosingBalance: number;
  totalBalance: number;
  totalIncome: number;
  totalCashExpenses: number;
  totalDeposits: number;
  totalRemesaPayments: number;
  totalCashAdjustments: number;
  totalBankAdjustments: number;
  remesaDebtTotal: number;
  realBankBalance: number | null;
  realCashBalance: number | null;
  closed: boolean;
}

export interface CashFlowCut {
  id: number;
  weekStart: string;
  weekEnd: string;
  cashOpeningBalance: number;
  cashClosingBalance: number;
  bankOpeningBalance: number;
  bankClosingBalance: number;
  totalIncome: number;
  totalCashExpenses: number;
  totalDeposits: number;
  totalRemesaPayments: number;
  remesaDebtTotal: number;
  realBankBalance: number | null;
  realCashBalance: number | null;
  bankDifference: number | null;
  cashDifference: number | null;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
}

export interface CreateCashFlowCutDTO {
  weekStart: string;
  weekEnd: string;
  realBankBalance?: number | null;
  realCashBalance?: number | null;
  note?: string | null;
}

export interface TripSuggestion {
  tripId: number;
  departureDate: string;
  driverId: number | null;
  driverName: string | null;
  routeId: number | null;
  collectible: number;
  collected: number;
  pending: number;
}

export interface CollectionSuggestion {
  paymentId: number;
  paymentDate: string;
  amount: number;
  folio: string | null;
  note: string | null;
  payerName: string | null;
  payerType: string | null;
  payerEntityId: number | null;
  collected: number;
  pending: number;
}

export interface Remesa {
  accountsPayableId: number;
  batchId: number | null;
  date: string;
  totalAmount: number;
  balance: number;
  paid: number;
  supplierName: string | null;
  status: "PENDIENTE" | "PARCIAL" | "PAGADA";
}

export interface AvailableExpense {
  id: number;
  date: string;
  amount: number;
  categoryCode: string | null;
  categoryName: string | null;
  reason: string | null;
  linked: boolean;
}

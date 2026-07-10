import type { AccountingEntityType } from "../../../accounting/types/accounting-entity.types";

export type AccountsPayableSourceType =
  | "BATCH"
  | "DELIVERY"
  | "ADJUSTMENT"
  | "OTHER";

export interface PoultryDetails {
  chickenQuantity: number;
  weight: number;
  pricePerKg: number;
}

export interface EggDetails {
  eggQuantity: number;
  pricePerEgg: number;
}
// -------- Requests --------

export interface CreateAccountsPayableRequest {
  creditorType: AccountingEntityType;
  creditorEntityId: number;
  debtorType: AccountingEntityType;
  debtorEntityId: number;
  amount: number;
  sourceType: AccountsPayableSourceType;
  sourceId?: number;
  solicitorId?: number;
  note?: string;
  date: string;

  chickenQuantity?: number;
  weight?: number;
  pricePerKg?: number;

  eggQuantity?: number;
  pricePerEgg?: number;
}

// -------- Responses --------
export interface AccountsPayableResponse {
  id: number;
  creditorId: number;
  creditorName: string;
  debtorId: number;
  debtorName: string;
  totalAmount: number;
  balance: number;
  sourceType?: AccountsPayableSourceType;
  sourceId?: number;
  sourceBatchId?: number;
  solicitorName?: string;
  solicitorId?: number;
  date: string;
  note: string;

  // El backend manda un objeto dinámico aquí
  details?: PoultryDetails | EggDetails;
}

export interface CreditSolicitor {
  id: number;
  name: string;
}
// movements.types.ts

export type AccountsPayableMovementType =
  | "PAYMENT"
  | "COMPENSATION"
  | "ADJUSTMENT"
  | "OTHER"
  | "REVERSAL";

export const movementTypeLabels: Record<AccountsPayableMovementType, string> = {
  PAYMENT: "Pago",
  COMPENSATION: "Compensación",
  ADJUSTMENT: "Ajuste",
  OTHER: "Otro",
  REVERSAL: "Reversa",
};

export interface AccountsPayableMovementResponse {
  id: number;
  movementType: AccountsPayableMovementType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
  movementDate: string;
  compensationPaymentId?: number;
  paymentId?: number;
  driverName?: string;
  routeName?: string;
  folio?: string;
}

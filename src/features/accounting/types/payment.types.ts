import type { AccountsPayableSourceType } from "@/features/live-chicken/accounting/accounts-payable/types";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "DEPOSIT"
  | "CHECK"
  | "OTHER";

export type PaymentStatus = "ACTIVE" | "CANCELLED";

// ---------- Requests ----------

export interface CreateFifoPaymentRequest {
  payerId: number;
  receiverId: number;

  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;

  folio?: string;
  note?: string;
}

export interface CreatePaymentRequest {
  accountsPaymentId: number;
  payerId: number;
  receiverId: number;

  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;

  folio?: string;
  note?: string;
  driverId?: number;
  routeId?: number;
}

export interface CreateAdvancePaymentRequest {
  payerId: number;
  receiverId: number;

  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;

  folio?: string;
  note?: string;
}

// ---------- Responses ----------

export interface PaymentResponse {
  id: number;
  amount: number;
  remainingAmount?: number;
  appliedAmount?: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;
  folio?: string;
  note?: string;
  status: PaymentStatus;
  createdAt: string; // ISO
  payerName?: string;
  receiverName?: string;
  payerEntityId?: number;
  receiverEntityId?: number;
}

export interface FifoPaymentPreviewItem {
  accountsPayableId: number;
  debtorName?: string;
  creditorName?: string;
  date: string; // yyyy-MM-dd
  balance: number;
  applyAmount: number;
}

export interface FifoPaymentPreview {
  items: FifoPaymentPreviewItem[];
  totalApplied: number;
  parkedAmount: number;
}

export interface PaymentApplication {
  accountsPayableId: number;
  debtorName?: string;
  creditorName?: string;
  appliedAmount: number;
  date: string; // yyyy-MM-dd
  sourceType?: AccountsPayableSourceType;
  sourceBatchId?: number;
}

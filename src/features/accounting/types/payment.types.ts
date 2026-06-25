export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "DEPOSIT"
  | "CHECK"
  | "OTHER";

export type PaymentStatus = "ACTIVE" | "CANCELLED";

// ---------- Requests ----------

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

// ---------- Responses ----------

export interface PaymentResponse {
  id: number;
  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;
  folio?: string;
  note?: string;
  status: PaymentStatus;
  createdAt: string; // ISO
  payerName?: string;
  receiverName?: string;
}

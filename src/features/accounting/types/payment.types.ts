export type PaymentMethod = "CASH" | "TRANSFER" | "DEPOSIT" | "CHECK" | "OTHER";

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
}

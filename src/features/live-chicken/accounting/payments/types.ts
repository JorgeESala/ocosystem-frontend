// enums (ajústalos si ya existen globales)
export type PaymentMethod = "CASH" | "TRANSFER" | "DEPOSIT" | "CHECK";

// ---------- Requests ----------

export interface CreatePaymentRequest {
  payerId: number;
  receiverId: number;

  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;

  folio?: string;
  notes?: string;
}

// ---------- Responses ----------

export interface PaymentResponse {
  id: number;
  amount: number;
  paymentDate: string; // yyyy-MM-dd
  paymentMethod: PaymentMethod;
  folio?: string;
  notes?: string;
}

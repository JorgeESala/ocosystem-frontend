export type ExpectedEventType =
  | "SALES_REPORT"
  | "EXPENSE"
  | "BATCH_RECEPTION"
  | "AP_REVIEW";

export const EXPECTED_EVENT_LABELS: Record<ExpectedEventType, string> = {
  EXPENSE: "Subir gastos",
  BATCH_RECEPTION: "Recibir remesa",
  SALES_REPORT: "Corte de ventas",
  AP_REVIEW: "Revisar Ctas x p",
};

export interface ExpectedEvent {
  id?: number;
  branchId: number;
  branchName?: string | null;
  eventType: ExpectedEventType;
  eventDate: string;
  cutoffTime?: string | null;
  note?: string | null;
  createdBy?: number | null;
}

export interface ExpectedEventBulkRequest {
  branchId: number;
  eventType: ExpectedEventType;
  dates: string[];
  cutoffTime?: string | null;
  note?: string | null;
}

export interface ExpectedEventBulkResponse {
  created: number;
  skipped: number;
  events: ExpectedEvent[];
}

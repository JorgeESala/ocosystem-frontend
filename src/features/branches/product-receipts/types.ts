export interface ReceiptCostDTO {
  id: number;
  unitCost: number;
  costUnit: string;
  toLineUnitFactor: number | null;
  enteredBy: string;
  enteredAt: string;
}

export interface ReceiptLineDTO {
  id: number;
  lineNumber: number;
  productBarcode: string | null;
  productName: string | null;
  sourceBarcode: string | null;
  observedName: string | null;
  quantity: number;
  unitName: string;
  unitId: number | null;
  toProductUnitFactor: number | null;
  latestCost: ReceiptCostDTO | null;
  costHistory: ReceiptCostDTO[];
}

export interface ReceiptSummaryDTO {
  id: number;
  branchId: number;
  branchName: string;
  receivedAt: string;
  recorderName: string;
  lineCount: number;
  unresolvedCount: number;
  pendingCostCount: number;
}

export interface ReceiptDetailDTO {
  id: number;
  branchId: number;
  branchName: string;
  receivedAt: string;
  createdAt: string;
  recorderName: string;
  lines: ReceiptLineDTO[];
}

export interface ReceiptFilters {
  branchIds: number[];
  from: string | null;
  to: string | null;
  pendingCostOnly: boolean;
  unresolvedOnly: boolean;
}

export interface RecordCostPayload {
  unitCost: number;
  costUnit: string;
  toLineUnitFactor?: number | null;
}

export interface ResolveLinePayload {
  productBarcode: string;
  toProductUnitFactor?: number | null;
}

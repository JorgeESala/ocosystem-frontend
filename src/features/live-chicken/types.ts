export interface InboundBatch {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  realWeight: number;
  declaredWeight: number;
  chickenQuantity: number;
  pricePerKg: number;
  totalPaid: number;
  avgWeight: number;
}
export interface InboundBatchSale {
  id: number;
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: string;
  employeeId: number;
  employeeName: string;
}
export interface UpdateInboundBatchSaleRequest {
  id: number;
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: string;
  employeeId: number;
}

export interface CreateInboundBatchSaleRequest {
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: string;
  employeeId: number;
}
export type CreateInboundBatchSalePayload = Omit<
  CreateInboundBatchSaleRequest,
  "date"
> & {
  date: Date;
};

export interface CreateInboundBatchRequest {
  supplierId: number;
  date: string;
  realWeight: number;
  declaredWeight: number;
  chickenQuantity: number;
  pricePerKg: number;
}

export interface UpdateInboundBatchRequest {
  supplierId?: number;
  date?: string;
  realWeight?: number;
  declaredWeight?: number;
  chickenQuantity?: number;
  pricePerKg?: number;
}

export interface InboundBatchFormValues {
  supplierId: number | null;
  date: Date | null;
  realWeight: string;
  declaredWeight: string;
  chickenQuantity: string;
  pricePerKg: string;
}
export type UpdateInboundBatchPayload = Omit<
  UpdateInboundBatchRequest,
  "date"
> & {
  date: Date | null;
};

export interface Supplier {
  id: number;
  name: string;
}

export interface UpdateInboundBatchSalePayload {
  id: number;
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: Date;
  employeeId: number;
}
export interface ExpenseResponseDTO {
  id: number;
  reason: string;
  amount: number;
  date: string;
}

export interface ExpenseCreateRequestDTO {
  reason: string;
  amount: number;
  date: Date;
}

export interface ExpenseUpdateRequestDTO {
  reason?: string;
  amount?: number;
  date?: Date;
}

export interface InboundBatch {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string; //(YYYY-MM-DD)
  realWeight: number;
  declaredWeight: number;
  chickenQuantity: number;
  pricePerKg: number;
  totalPaid: number;
  avgWeight: number;
}

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

export interface Supplier {
  id: number;
  name: string;
}

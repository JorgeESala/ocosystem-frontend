export interface CreateEggBatchRequest {
  supplierId: number | null;
  date: Date | null;
  realWeight: string;
  weight: string;
  boxQuantity: string;
  pricePerCarton: string;
}

export interface EggBatch {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  weight: number;
  boxQuantity: number;
  pricePerKg: number;
  totalPaid: number;
  avgWeight: number;
}
export interface CreateEggBatchSaleRequest {
  routeId?: number;
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: string;
  employeeId: number;
}
export interface CreateEggBatchSaleRequest {
  routeId?: number;
  batchId: number;
  quantitySold: number;
  saleTotal: number;
  kgSold: number;
  kgSent: number;
  date: string;
  employeeId: number;
}

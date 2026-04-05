export interface CreateEggBatchRequest {
  supplierId: number | null;
  date: Date | null;
  realWeight: string;
  weight: string;
  boxQuantity: string;
  pricePerCarton: string;
}

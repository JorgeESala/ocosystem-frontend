export interface WeeklyWeightDiffRow {
  weekStart: string;
  supplierId: number;
  supplierName: string;
  totalDeclaredWeight: number;
  totalRealWeight: number;
  weightDiff: number;
  weightDiffPct: number;
  monetaryDiff: number;
  batchCount: number;
}

export interface WeeklyWeightDiffBatchRow {
  batchId: number;
  entryDate: string;
  supplierId: number;
  supplierName: string;
  chickenQuantity: number;
  pricePerKg: number;
  declaredWeight: number;
  realWeight: number;
  weightDiff: number;
  monetaryDiff: number;
  weightDiffPct: number;
}

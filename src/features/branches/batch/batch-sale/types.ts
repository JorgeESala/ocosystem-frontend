export interface ReportBatchSale {
  batchId: number;
  employeeId?: number | undefined;
  clientId?: number | undefined;
  quantitySold: string;
  kgTotal: string;
  saleTotal: string;
  kgGut: string;
  date: string;
}

export interface ExtractExcelResponse {
  batches: ReportBatchSale[];
}

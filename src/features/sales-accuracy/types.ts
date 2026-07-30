export interface BranchAccuracyDTO {
  branchId: number;
  branchName: string;
  accuracy: number;
  correctionCount: number;
  daysWithPosData: number;
  daysWithBatchData: number;
  posTotal: number;
  batchTotal: number;
  diffAmount: number;
}

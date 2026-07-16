export interface ExcludedBranch {
  id?: number;
  branchId: number;
  branchName?: string | null;
  reason?: string | null;
  createdBy?: number | null;
}

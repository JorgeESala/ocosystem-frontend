export type ChecklistTaskId =
  | "UPLOAD_SALES_REPORT"
  | "REGISTER_EXPENSES"
  | "REGISTER_SALES_AND_ENTRIES"
  | "REVIEW_ACCOUNTS_PAYABLE";

export type ChecklistStatus = "DONE" | "PENDING";

export interface ChecklistTaskEntry {
  taskId: ChecklistTaskId;
  label: string;
  status: ChecklistStatus;
  detail: string;
  dueAt: string | null;
  evaluatedAt: string;
}

export interface BranchChecklist {
  branchId: number;
  branchName: string;
  tasks: ChecklistTaskEntry[];
}

export interface ChecklistSummary {
  totalBranches: number;
  branchesComplete: number;
  branchesPartial: number;
  branchesEmpty: number;
}

export interface ChecklistResponse {
  date: string;
  evaluatedAt: string;
  summary: ChecklistSummary;
  branches: BranchChecklist[];
}

export interface ChecklistQueryParams {
  date: string;
  branchIds?: number[];
}

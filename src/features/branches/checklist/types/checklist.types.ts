export type ChecklistTaskId =
  | "UPLOAD_SALES_REPORT"
  | "REGISTER_EXPENSES"
  | "REGISTER_SALES_AND_ENTRIES"
  | "REVIEW_ACCOUNTS_PAYABLE";

export type ChecklistStatus = "DONE" | "EMPTY" | "NOT_APPLICABLE";

export interface ChecklistTaskEntry {
  taskId: ChecklistTaskId;
  label: string;
  status: ChecklistStatus;
  detail: string;
  dueAt: string | null;
  evaluatedAt: string;
  late?: boolean | null;
  cutoffTime?: string | null;
  optional?: boolean;
}

export interface PersonInCharge {
  id: number | null;
  name: string | null;
  daysAsInCharge?: number | null;
}

export type MetricAccent =
  | "blue"
  | "rose"
  | "amber"
  | "purple"
  | "emerald"
  | "gray";

export interface MetricResult {
  id: string;
  label: string;
  accent: MetricAccent;
  score: number | null;
  weight: number;
  detail: string;
  evaluable: boolean;
  missingTaskLabels?: string[];
}

export interface MetricSummary {
  id: string;
  label: string;
  accent: MetricAccent;
  score: number | null;
  weight: number;
  evaluable: boolean;
  evaluableBranches: number;
  detail?: string;
  missingTaskLabels?: string[];
}

export interface BranchChecklist {
  branchId: number;
  branchName: string;
  tasks: ChecklistTaskEntry[];
  metricResults?: MetricResult[];
  combinedScore?: number | null;
  personInCharge?: PersonInCharge | null;
}

export interface ChecklistSummary {
  totalBranches: number;
  branchesComplete: number;
  branchesPartial: number;
  branchesEmpty: number;
  from?: string;
  to?: string;
  previousFrom?: string;
  previousTo?: string;
  metrics?: MetricSummary[];
  combinedScore?: number | null;
  previousCombinedScore?: number | null;
  evaluableBranches?: number;
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

export interface PerformanceQueryParams {
  from: string;
  to: string;
  branchIds?: number[];
}

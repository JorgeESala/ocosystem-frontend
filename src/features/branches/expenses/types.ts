import type {
  ExpenseComparisonItem,
  ExpenseComparisonTotals,
} from "@/features/expenses/types/expense.types";

export interface BranchExpenseResponseDTO {
  id: number;
  branchId: number;
  branchName: string;
  expenseCategoryId?: number;
  expenseCategoryName: string;
  expenseCategoryCode?: string | null;
  businessUnitCategoryId?: number;
  businessUnitCategoryName?: string;
  businessUnitName?: string;
  amount: number;
  date: string;
  reason: string;
}

export interface BranchExpenseRequestDTO {
  branchId: number;
  expenseCategoryId: number;
  businessUnitCategoryId: number;
  amount: number;
  date: Date;
  reason: string;
}

export type BranchExpenseReportGroup =
  | "COSTO"
  | "VENTA"
  | "ADMIN"
  | "INVERSION"
  | "NO_GASTO";

export interface ExpenseCategoryDTO {
  id: number;
  name: string;
  code?: string | null;
  parentId?: number | null;
  parentName?: string | null;
  reportGroup?: BranchExpenseReportGroup | null;
  active?: boolean;
  sortOrder?: number;
  visibleInBranchApp?: boolean;
  replacedById?: number | null;
  selectable?: boolean;
}

export interface BranchCategoryDTO {
  id: number;
  name: string;
  parent_id?: number | null;
}

export interface BranchExpenseFilters {
  branchIds: number[];
  startDate: Date;
  endDate: Date;
}

export interface BranchExpenseComparisonRequest {
  branchIds: number[];
  businessUnitCategoryIds: number[];
  expenseCategoryIds: number[];
  reason?: string;
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
}

export interface BranchExpenseComparisonBranch {
  branchId: number;
  branchName: string;
  currentAmount: number;
  currentCount: number;
  previousAmount: number;
  previousCount: number;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
  newInCurrent: boolean;
  byCategory: BranchExpenseComparisonItem[];
}

export interface BranchExpenseComparisonResponse {
  current: ExpenseComparisonTotals;
  previous: ExpenseComparisonTotals;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
  branches: BranchExpenseComparisonBranch[];
  byCategory: BranchExpenseComparisonItem[];
}

export type BranchExpenseComparisonItem = ExpenseComparisonItem;

export type BranchExpenseGranularity = "WEEK" | "MONTH" | "YEAR";

export interface BranchExpenseAnalyticsRequest {
  branchIds: number[];
  businessUnitCategoryIds: number[];
  expenseCategoryIds: number[];
  reason?: string;
  startDate: Date;
  endDate: Date;
  previousStartDate?: Date;
  previousEndDate?: Date;
  granularity: BranchExpenseGranularity;
  includeNonOperating: boolean;
}

export interface BranchExpenseAnalyticsBucketCategory {
  id: number | null;
  name: string;
  amount: number;
  count: number;
}

export interface BranchExpenseAnalyticsBucket {
  key: string;
  start: string;
  end: string;
  label: string;
  amount: number;
  count: number;
  categories: BranchExpenseAnalyticsBucketCategory[];
}

export interface BranchExpenseAnalyticsCategory {
  id: number | null;
  code: string | null;
  name: string;
  parentId: number | null;
  parentName: string | null;
  reportGroup: BranchExpenseReportGroup | null;
  currentAmount: number;
  currentCount: number;
  previousAmount: number;
  previousCount: number;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
  children: BranchExpenseAnalyticsCategory[];
}

export interface BranchExpenseAnalyticsRow {
  id: number | null;
  name: string;
  currentAmount: number;
  currentCount: number;
  previousAmount: number;
  previousCount: number;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
}

export interface BranchExpenseAnalyticsResponse {
  current: ExpenseComparisonTotals;
  previous: ExpenseComparisonTotals;
  amountDifference: number;
  amountVariationPct: number | null;
  countDifference: number;
  countVariationPct: number | null;
  buckets: BranchExpenseAnalyticsBucket[];
  categories: BranchExpenseAnalyticsCategory[];
  branches: BranchExpenseAnalyticsRow[];
  businessUnits: BranchExpenseAnalyticsRow[];
}

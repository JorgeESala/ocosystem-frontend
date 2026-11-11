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

export interface ExpenseCategoryDTO {
  id: number;
  name: string;
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
  businessUnitCategoryId: number;
  expenseCategoryId?: number;
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

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

import { http } from "@/shared/api/http";
import type {
  BranchExpenseFilters,
  BranchExpenseRequestDTO,
  BranchExpenseResponseDTO,
} from "../types";

const API_BASE = "/api/expenses";

const normalizeExpense = (
  expense: BranchExpenseResponseDTO,
): BranchExpenseResponseDTO => ({
  ...expense,
  expenseCategoryId:
    expense.expenseCategoryId ?? (expense as any).categoryId ?? undefined,
  businessUnitCategoryId:
    expense.businessUnitCategoryId ??
    (expense as any).businessUnitCategoryId ??
    undefined,
  businessUnitCategoryName:
    expense.businessUnitCategoryName ?? expense.businessUnitName,
});

export const branchExpensesApi = {
  getLatest: async (): Promise<BranchExpenseResponseDTO[]> => {
    const { data } = await http.get<BranchExpenseResponseDTO[]>(
      `${API_BASE}/latest`,
    );
    return data.map(normalizeExpense);
  },

  search: async (
    filters: BranchExpenseFilters,
  ): Promise<BranchExpenseResponseDTO[]> => {
    const { data } = await http.post<BranchExpenseResponseDTO[]>(
      `${API_BASE}/search`,
      {
        start: filters.startDate.toISOString(),
        end: filters.endDate.toISOString(),
        branchIds: filters.branchIds,
      },
    );

    return data.map(normalizeExpense);
  },

  create: async (
    payload: BranchExpenseRequestDTO,
  ): Promise<BranchExpenseResponseDTO> => {
    const { data } = await http.post<BranchExpenseResponseDTO>(API_BASE, payload);
    return normalizeExpense(data);
  },

  update: async (
    id: number,
    payload: BranchExpenseRequestDTO,
  ): Promise<BranchExpenseResponseDTO> => {
    const { data } = await http.put<BranchExpenseResponseDTO>(
      `${API_BASE}/${id}`,
      payload,
    );

    return normalizeExpense(data);
  },
};

import { http } from "@/shared/api/http";
import type { BranchCategoryDTO, ExpenseCategoryDTO } from "../types";

export const branchCategoriesApi = {
  getAll: async (): Promise<BranchCategoryDTO[]> => {
    const { data } = await http.get<BranchCategoryDTO[]>("/api/categories");
    return data;
  },
};

export const expenseCategoriesApi = {
  getAll: async (): Promise<ExpenseCategoryDTO[]> => {
    const { data } = await http.get<ExpenseCategoryDTO[]>(
      "/api/expense-categories",
    );
    return data;
  },
};

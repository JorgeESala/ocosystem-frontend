import { useQuery } from "@tanstack/react-query";
import {
  branchCategoriesApi,
  expenseCategoriesApi,
} from "./branch-categories.api";
import { branchCategoriesKeys } from "./branch-categories.keys";

export const useBranchBusinessCategories = () =>
  useQuery({
    queryKey: branchCategoriesKeys.businessUnits(),
    queryFn: branchCategoriesApi.getAll,
  });

export const useExpenseCategories = () =>
  useQuery({
    queryKey: branchCategoriesKeys.expenseCategories(),
    queryFn: expenseCategoriesApi.getAll,
  });

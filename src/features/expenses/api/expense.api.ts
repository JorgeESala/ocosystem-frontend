import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type { ExpenseCategoryCode, ExpenseType } from "@/core/api/types";
import type {
  ExpenseComparisonResponse,
  ExpenseCreateRequestDTO,
  ExpenseDetailResponseDTO,
  ExpenseResponseDTO,
} from "../types/expense.types";

const BASE_URL = "/api/v1/expenses";

export const expenseApi = {
  create: async (
    payload: ExpenseCreateRequestDTO,
  ): Promise<ExpenseResponseDTO> => {
    const { data } = await http.post(BASE_URL, payload);
    return data;
  },

  filter: async (
    start?: string,
    end?: string,
  ): Promise<ExpenseResponseDTO[]> => {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    const { data } = await http.get(`${BASE_URL}/filter`, { params });
    return data;
  },

  compare: async (
    start: Date,
    end: Date,
    previousStart: Date,
    previousEnd: Date,
    categories: ExpenseCategoryCode[] = [],
    expenseTypes: ExpenseType[] = [],
  ): Promise<ExpenseComparisonResponse> => {
    const params: Record<string, string> = {
      start: toLocalDateString(start),
      end: toLocalDateString(end),
      previousStart: toLocalDateString(previousStart),
      previousEnd: toLocalDateString(previousEnd),
    };
    if (categories.length > 0) params.categories = categories.join(",");
    if (expenseTypes.length > 0) params.expenseTypes = expenseTypes.join(",");

    const { data } = await http.get<ExpenseComparisonResponse>(
      `${BASE_URL}/comparison`,
      { params },
    );
    return data;
  },

  getById: async (id: number): Promise<ExpenseDetailResponseDTO> => {
    const { data } = await http.get(`${BASE_URL}/${id}`);
    return data;
  },

  update: async (
    id: number,
    payload: ExpenseCreateRequestDTO,
  ): Promise<ExpenseResponseDTO> => {
    const { data } = await http.put(`${BASE_URL}/${id}`, payload);
    return data;
  },
};

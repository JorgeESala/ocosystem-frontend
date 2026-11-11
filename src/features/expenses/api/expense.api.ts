import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
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

  getLatest: async (): Promise<ExpenseResponseDTO[]> => {
    const { data } = await http.get(`${BASE_URL}/latest`);
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
  ): Promise<ExpenseComparisonResponse> => {
    const { data } = await http.get<ExpenseComparisonResponse>(
      `${BASE_URL}/comparison`,
      {
        params: {
          start: toLocalDateString(start),
          end: toLocalDateString(end),
          previousStart: toLocalDateString(previousStart),
          previousEnd: toLocalDateString(previousEnd),
        },
      },
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

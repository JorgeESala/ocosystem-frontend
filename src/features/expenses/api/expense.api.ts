import { http } from "@/shared/api/http";
import type {
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

  getBetween: async (
    start: string,
    end: string,
  ): Promise<ExpenseResponseDTO[]> => {
    const { data } = await http.get(BASE_URL, {
      params: { start, end },
    });
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
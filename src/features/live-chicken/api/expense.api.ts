import { toLocalDateString } from "@/utils/date.utils";
import type {
  ExpenseCreateRequestDTO,
  ExpenseResponseDTO,
  ExpenseUpdateRequestDTO,
} from "../types";
import { http } from "@/services/api";
const BASE_URL = "/api/live-chicken/expenses";

export const getExpenses = async (): Promise<ExpenseResponseDTO[]> => {
  const { data } = await http.get(BASE_URL);
  return data;
};

export const getLatestExpenses = async (): Promise<ExpenseResponseDTO[]> => {
  const { data } = await http.get(`${BASE_URL}/latest`);
  return data;
};

export const createExpense = async (dto: ExpenseCreateRequestDTO) => {
  const payload = {
    ...dto,
    date: toLocalDateString(dto.date),
  };

  const { data } = await http.post(BASE_URL, payload);
  return data;
};

export const updateExpense = async (
  id: number,
  dto: ExpenseUpdateRequestDTO,
): Promise<ExpenseResponseDTO> => {
  const { data } = await http.put(`${BASE_URL}/${id}`, dto);
  return data;
};

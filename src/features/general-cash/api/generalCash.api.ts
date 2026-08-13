import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type {
  CashAdjustmentDTO,
  CashFlowFrequency,
  CashFlowHistoryDTO,
  CashFlowResponseDTO,
  CashReserveAlertDTO,
  CashReserveResponseDTO,
  CreateCashAdjustmentDTO,
  CreateCashReserveDTO,
  UpdateCashAdjustmentDTO,
  UpdateCashReserveDTO,
} from "../types";

const BASE_URL = "/api/v1/branches/general-cash";

export const cashReserveApi = {
  getAll: async (): Promise<CashReserveResponseDTO[]> => {
    const { data } = await http.get<CashReserveResponseDTO[]>(BASE_URL);
    return data;
  },

  getById: async (id: number): Promise<CashReserveResponseDTO> => {
    const { data } = await http.get<CashReserveResponseDTO>(
      `${BASE_URL}/${id}`,
    );
    return data;
  },

  create: async (
    payload: CreateCashReserveDTO,
  ): Promise<CashReserveResponseDTO> => {
    const { data } = await http.post<CashReserveResponseDTO>(BASE_URL, payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdateCashReserveDTO,
  ): Promise<CashReserveResponseDTO> => {
    const { data } = await http.put<CashReserveResponseDTO>(
      `${BASE_URL}/${id}`,
      payload,
    );
    return data;
  },

  getFlow: async (
    id: number,
    start: Date,
    end: Date,
    frequency: CashFlowFrequency,
  ): Promise<CashFlowResponseDTO> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));
    params.append("frequency", frequency);

    const { data } = await http.get<CashFlowResponseDTO>(
      `${BASE_URL}/${id}/flow?${params.toString()}`,
    );
    return data;
  },

  getGlobalFlow: async (
    start: Date,
    end: Date,
    frequency: CashFlowFrequency,
  ): Promise<CashFlowResponseDTO> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));
    params.append("frequency", frequency);

    const { data } = await http.get<CashFlowResponseDTO>(
      `${BASE_URL}/flow/global?${params.toString()}`,
    );
    return data;
  },

  getAlerts: async (): Promise<CashReserveAlertDTO[]> => {
    const { data } = await http.get<CashReserveAlertDTO[]>(
      `${BASE_URL}/alerts`,
    );
    return data;
  },

  getHistory: async (
    id: number,
    start: Date,
    end: Date,
  ): Promise<CashFlowHistoryDTO[]> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));

    const { data } = await http.get<CashFlowHistoryDTO[]>(
      `${BASE_URL}/${id}/history?${params.toString()}`,
    );
    return data;
  },

  recalculate: async (id: number): Promise<void> => {
    await http.post(`${BASE_URL}/${id}/recalculate`);
  },

  recalculateAll: async (): Promise<void> => {
    await http.post(`${BASE_URL}/recalculate`);
  },
};

const ADJUSTMENT_URL = "/api/v1/branches/general-cash-adjustments";

export const cashAdjustmentApi = {
  getByBranch: async (
    branchId: number,
    start: Date,
    end: Date,
  ): Promise<CashAdjustmentDTO[]> => {
    const params = new URLSearchParams();
    params.append("branchId", branchId.toString());
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));

    const { data } = await http.get<CashAdjustmentDTO[]>(
      `${ADJUSTMENT_URL}?${params.toString()}`,
    );
    return data;
  },

  create: async (
    payload: CreateCashAdjustmentDTO,
  ): Promise<CashAdjustmentDTO> => {
    const { data } = await http.post<CashAdjustmentDTO>(
      ADJUSTMENT_URL,
      payload,
    );
    return data;
  },

  update: async (
    id: number,
    payload: UpdateCashAdjustmentDTO,
  ): Promise<CashAdjustmentDTO> => {
    const { data } = await http.put<CashAdjustmentDTO>(
      `${ADJUSTMENT_URL}/${id}`,
      payload,
    );
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${ADJUSTMENT_URL}/${id}`);
  },
};

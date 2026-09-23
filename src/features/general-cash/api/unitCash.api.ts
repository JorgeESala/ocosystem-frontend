import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type {
  CreateUnitCashAdjustmentDTO,
  CreateUnitCashDTO,
  UnitCashAccountDTO,
  UnitCashAdjustmentDTO,
  UnitCashAlertDTO,
  UnitCashFlowResponseDTO,
  UnitCashFrequency,
  UnitCashHistoryDTO,
  UnitCashReconciliationPlanDTO,
  UnitCashReconciliationSummaryDTO,
  UpdateUnitCashAdjustmentDTO,
  UpdateUnitCashDTO,
} from "../types.unit";

const BASE_URL = "/api/v1/general-cash";

export const unitCashApi = {
  getAccount: async (): Promise<UnitCashAccountDTO | null> => {
    const response = await http.get<UnitCashAccountDTO>(BASE_URL);
    if (response.status === 204) {
      return null;
    }
    return response.data;
  },

  create: async (payload: CreateUnitCashDTO): Promise<UnitCashAccountDTO> => {
    const { data } = await http.post<UnitCashAccountDTO>(BASE_URL, payload);
    return data;
  },

  update: async (payload: UpdateUnitCashDTO): Promise<UnitCashAccountDTO> => {
    const { data } = await http.put<UnitCashAccountDTO>(BASE_URL, payload);
    return data;
  },

  getFlow: async (
    start: Date,
    end: Date,
    frequency: UnitCashFrequency,
  ): Promise<UnitCashFlowResponseDTO> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));
    params.append("frequency", frequency);

    const { data } = await http.get<UnitCashFlowResponseDTO>(
      `${BASE_URL}/flow?${params.toString()}`,
    );
    return data;
  },

  getHistory: async (start: Date, end: Date): Promise<UnitCashHistoryDTO[]> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));

    const { data } = await http.get<UnitCashHistoryDTO[]>(
      `${BASE_URL}/history?${params.toString()}`,
    );
    return data;
  },

  getAlerts: async (): Promise<UnitCashAlertDTO[]> => {
    const { data } = await http.get<UnitCashAlertDTO[]>(`${BASE_URL}/alerts`);
    return data;
  },

  recalculate: async (): Promise<void> => {
    await http.post(`${BASE_URL}/recalculate`);
  },

  getReconciliationPreview:
    async (): Promise<UnitCashReconciliationPlanDTO> => {
      const { data } = await http.get<UnitCashReconciliationPlanDTO>(
        `${BASE_URL}/reconcile/preview`,
      );
      return data;
    },

  applyReconciliation: async (): Promise<UnitCashReconciliationSummaryDTO> => {
    const { data } = await http.post<UnitCashReconciliationSummaryDTO>(
      `${BASE_URL}/reconcile`,
    );
    return data;
  },

  getAdjustments: async (
    start: Date,
    end: Date,
  ): Promise<UnitCashAdjustmentDTO[]> => {
    const params = new URLSearchParams();
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));

    const { data } = await http.get<UnitCashAdjustmentDTO[]>(
      `${BASE_URL}/adjustments?${params.toString()}`,
    );
    return data;
  },

  createAdjustment: async (
    payload: CreateUnitCashAdjustmentDTO,
  ): Promise<UnitCashAdjustmentDTO> => {
    const { data } = await http.post<UnitCashAdjustmentDTO>(
      `${BASE_URL}/adjustments`,
      payload,
    );
    return data;
  },

  updateAdjustment: async (
    id: number,
    payload: UpdateUnitCashAdjustmentDTO,
  ): Promise<UnitCashAdjustmentDTO> => {
    const { data } = await http.put<UnitCashAdjustmentDTO>(
      `${BASE_URL}/adjustments/${id}`,
      payload,
    );
    return data;
  },

  deleteAdjustment: async (id: number): Promise<void> => {
    await http.delete(`${BASE_URL}/adjustments/${id}`);
  },
};

import { http } from "@/shared/api/http";
import type { DeliveryScheduleDTO, UpdateDeliveryScheduleDTO, OrderPredictionDTO } from "../types";

const SCHEDULE_URL = "/api/v1/branches/delivery-schedule";
const PREDICTION_URL = "/api/v1/branches/order-predictions";

export const deliveryScheduleApi = {
  getAll: async (): Promise<DeliveryScheduleDTO[]> => {
    const { data } = await http.get<DeliveryScheduleDTO[]>(SCHEDULE_URL);
    return data;
  },

  upsert: async (
    branchId: number,
    payload: UpdateDeliveryScheduleDTO,
  ): Promise<DeliveryScheduleDTO> => {
    const { data } = await http.put<DeliveryScheduleDTO>(
      `${SCHEDULE_URL}/${branchId}`,
      payload,
    );
    return data;
  },
};

export const orderPredictionApi = {
  getAll: async (): Promise<OrderPredictionDTO[]> => {
    const { data } = await http.get<OrderPredictionDTO[]>(PREDICTION_URL);
    return data;
  },

  getByBranch: async (branchId: number): Promise<OrderPredictionDTO> => {
    const { data } = await http.get<OrderPredictionDTO>(
      `${PREDICTION_URL}/${branchId}`,
    );
    return data;
  },
};

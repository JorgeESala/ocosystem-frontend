import { http } from "@/shared/api/http";
import type {
  TripCreateRequestDTO,
  TripResponseDTO,
  TripSaleDTO,
  TripSummaryDTO,
  TripUpdateRequestDTO,
} from "../types/trip.types";

const BASE_URL = "/api/v1/trips";

export const tripApi = {
  create: async (payload: TripCreateRequestDTO): Promise<TripResponseDTO> => {
    const { data } = await http.post<TripResponseDTO>(BASE_URL, payload);
    return data;
  },

  getByBatch: async (batchId: number): Promise<TripSummaryDTO[]> => {
    const { data } = await http.get<TripSummaryDTO[]>(
      `${BASE_URL}/by-batch/${batchId}`,
    );
    return data;
  },

  getSalesForTrip: async (tripId: number): Promise<TripSaleDTO[]> => {
    const { data } = await http.get<TripSaleDTO[]>(
      `${BASE_URL}/${tripId}/sales`,
    );
    return data;
  },

  getSalesByDriverAndDate: async (
    driverId: number,
    date: string,
  ): Promise<TripSaleDTO[]> => {
    const { data } = await http.get<TripSaleDTO[]>(
      `${BASE_URL}/sales-by-driver-date`,
      { params: { driverId, date } },
    );
    return data;
  },

  update: async (
    id: number,
    payload: TripUpdateRequestDTO,
  ): Promise<TripResponseDTO> => {
    const { data } = await http.put<TripResponseDTO>(
      `${BASE_URL}/${id}`,
      payload,
    );
    return data;
  },
};

import { http } from "@/shared/api/http";
import type { NotificationDTO, NotificationSummaryDTO } from "../types";

const BASE_URL = "/api/v1/notifications";

export const notificationApi = {
  getSummary: async (branchIds: number[]): Promise<NotificationSummaryDTO> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    const { data } = await http.get<NotificationSummaryDTO>(
      `${BASE_URL}/summary?${params.toString()}`,
    );
    return data;
  },

  getAll: async (branchIds: number[]): Promise<NotificationDTO[]> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    const { data } = await http.get<NotificationDTO[]>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await http.put(`${BASE_URL}/${id}/read`);
  },

  markAllAsRead: async (branchIds: number[]): Promise<void> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    await http.put(`${BASE_URL}/read-all?${params.toString()}`);
  },

  dismiss: async (id: number): Promise<void> => {
    await http.delete(`${BASE_URL}/${id}`);
  },

  checkAlerts: async (branchIds: number[]): Promise<void> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    await http.post(`${BASE_URL}/check?${params.toString()}`);
  },
};

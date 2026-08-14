import { http } from "@/shared/api/http";
import type {
  NotificationDTO,
  NotificationSummaryDTO,
  NotificationDetailDTO,
} from "../types";

const BASE_URL = "/api/v1/notifications";

export interface NotificationPage {
  content: NotificationDTO[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

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

  checkAlerts: async (branchIds: number[]): Promise<void> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    await http.post(`${BASE_URL}/check?${params.toString()}`);
  },

  getDetail: async (id: number): Promise<NotificationDetailDTO | null> => {
    try {
      const { data } = await http.get<NotificationDetailDTO>(
        `${BASE_URL}/${id}/detail`,
      );
      return data;
    } catch {
      return null;
    }
  },

  getHistory: async (
    branchIds: number[],
    page: number,
    size: number,
  ): Promise<NotificationPage> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    params.append("page", page.toString());
    params.append("size", size.toString());
    const { data } = await http.get<NotificationPage>(
      `${BASE_URL}/history?${params.toString()}`,
    );
    return data;
  },
};

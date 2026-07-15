import { http } from "@/shared/api/http";
import type { ScheduleTemplate } from "../types/schedule-template.types";

const API_BASE = "/api/v1/branches/schedule-templates";

export const scheduleTemplatesApi = {
  list: async (params?: { branchId?: number }): Promise<ScheduleTemplate[]> => {
    const qs = params?.branchId ? `?branchId=${params.branchId}` : "";
    const { data } = await http.get<ScheduleTemplate[]>(`${API_BASE}${qs}`);
    return data;
  },

  create: async (template: Omit<ScheduleTemplate, "id" | "branchName" | "createdBy">): Promise<ScheduleTemplate> => {
    const { data } = await http.post<ScheduleTemplate>(API_BASE, template);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_BASE}/${id}`);
  },
};

import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type { SalesAnalyticsDTO } from "../types";

const BASE_URL = "/api/v1/branches/sales-analytics";

export const salesAnalyticsApi = {
  getAnalytics: async (
    branchIds: number[],
    start: Date,
    end: Date,
  ): Promise<SalesAnalyticsDTO> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));

    const { data } = await http.get<SalesAnalyticsDTO>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data;
  },

  downloadPdf: async (
    branchIds: number[],
    start: Date,
    end: Date,
    product: string,
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    branchIds.forEach((id) => params.append("branchIds", id.toString()));
    params.append("start", toLocalDateString(start));
    params.append("end", toLocalDateString(end));
    params.append("product", product);

    const { data } = await http.get<Blob>(
      `${BASE_URL}/pdf?${params.toString()}`,
      { responseType: "blob" },
    );
    return new Blob([data], { type: "application/pdf" });
  },
};

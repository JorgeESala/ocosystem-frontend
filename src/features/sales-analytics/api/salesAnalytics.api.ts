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
};

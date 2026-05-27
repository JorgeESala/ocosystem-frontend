import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type {
  BranchProfitFilters,
  BranchProfitReportDTO,
} from "../types";

export const branchProfitApi = {
  getReport: async (
    filters: BranchProfitFilters,
  ): Promise<BranchProfitReportDTO> => {
    const params = new URLSearchParams();

    filters.branchIds.forEach((branchId) => {
      params.append("branchIds", branchId.toString());
    });

    params.append("start", toLocalDateString(filters.startDate));
    params.append("end", toLocalDateString(filters.endDate));

    const { data } = await http.get<BranchProfitReportDTO>(
      `/api/reports/profit?${params.toString()}`,
    );

    return data;
  },
};


import { http } from "@/shared/api/http";
import { toLocalDateString } from "@/utils/date.utils";
import type { BranchesDashboardDTO } from "./branchesDashboard.types";

export const fetchBranchesDashboard = async (
  branchIds: number[],
  start: Date,
  end: Date,
): Promise<BranchesDashboardDTO> => {
  const params = new URLSearchParams();
  branchIds.forEach((id) => params.append("branchIds", id.toString()));
  params.append("start", toLocalDateString(start));
  params.append("end", toLocalDateString(end));

  const { data } = await http.get<BranchesDashboardDTO>(
    `/api/reports/branches/dashboard?${params.toString()}`,
  );
  return data;
};

import { http } from "@/shared/api/http";
import type { ProfitReport } from "../types";

const API_BASE = "/api/v1";

export const getProfitReport = async (
  start: string,
  end: string,
): Promise<ProfitReport> => {
  const params = new URLSearchParams({ start, end });
  const { data } = await http.get<ProfitReport>(
    `${API_BASE}/reports/profit?${params}`,
  );
  return data;
};

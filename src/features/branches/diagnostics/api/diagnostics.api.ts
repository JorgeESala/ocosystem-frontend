import { http } from "@/shared/api/http";
import type {
  DiagnosticDetailDTO,
  DiagnosticFilters,
  DiagnosticPageDTO,
} from "../types";

export const searchDiagnostics = async (
  filters: DiagnosticFilters,
): Promise<DiagnosticPageDTO> => {
  const { data } = await http.get("/api/v1/branches/diagnostics", {
    params: {
      branchId: filters.branchId,
      level: filters.level,
      from: filters.from,
      to: filters.to,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
    },
  });
  return data;
};

export const getDiagnostic = async (
  id: number,
): Promise<DiagnosticDetailDTO> => {
  const { data } = await http.get(`/api/v1/branches/diagnostics/${id}`);
  return data;
};

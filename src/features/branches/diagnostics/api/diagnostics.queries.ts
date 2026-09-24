import { useQuery } from "@tanstack/react-query";
import { diagnosticKeys } from "./diagnostics.keys";
import * as api from "./diagnostics.api";
import type { DiagnosticFilters } from "../types";

export const useDiagnostics = (filters: DiagnosticFilters | null) => {
  return useQuery({
    queryKey: diagnosticKeys.search(filters ?? { from: "", to: "" }),
    queryFn: () => api.searchDiagnostics(filters as DiagnosticFilters),
    enabled: Boolean(filters),
  });
};

export const useDiagnosticDetail = (id: number | null) => {
  return useQuery({
    queryKey: diagnosticKeys.detail(id ?? 0),
    queryFn: () => api.getDiagnostic(id as number),
    enabled: id != null,
  });
};

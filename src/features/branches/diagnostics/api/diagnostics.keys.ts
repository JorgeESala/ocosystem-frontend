import type { DiagnosticFilters } from "../types";

export const diagnosticKeys = {
  all: ["branch-diagnostics"] as const,
  search: (filters: DiagnosticFilters) =>
    [...diagnosticKeys.all, "search", filters] as const,
  detail: (id: number) => [...diagnosticKeys.all, "detail", id] as const,
};

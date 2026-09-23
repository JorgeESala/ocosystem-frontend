import type { ComparisonMode } from "@/core/api/types";

export const clientsRoutesSummaryKeys = {
  all: ["clientsRoutesSummary"] as const,

  summary: (
    business: string | undefined,
    from: string,
    to: string,
    dormantDays: number,
    comparison: ComparisonMode,
  ) =>
    [
      ...clientsRoutesSummaryKeys.all,
      "summary",
      business ?? "public",
      from,
      to,
      dormantDays,
      comparison,
    ] as const,

  calendar: (business?: string) =>
    [
      ...clientsRoutesSummaryKeys.all,
      "calendar",
      business ?? "public",
    ] as const,
};

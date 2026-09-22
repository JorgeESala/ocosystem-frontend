export const clientsRoutesSummaryKeys = {
  all: ["clientsRoutesSummary"] as const,

  summary: (
    business: string | undefined,
    from: string,
    to: string,
    dormantDays: number,
  ) =>
    [
      ...clientsRoutesSummaryKeys.all,
      "summary",
      business ?? "public",
      from,
      to,
      dormantDays,
    ] as const,

  calendar: (business?: string) =>
    [
      ...clientsRoutesSummaryKeys.all,
      "calendar",
      business ?? "public",
    ] as const,
};

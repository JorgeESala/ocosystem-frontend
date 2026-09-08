export const clientSummaryKeys = {
  all: ["client-statement-summary"] as const,
  detail: (
    business: string | undefined,
    debtorEntityId: number,
    from: string,
    to: string,
  ) =>
    [
      ...clientSummaryKeys.all,
      business ?? "public",
      debtorEntityId,
      from,
      to,
    ] as const,
};

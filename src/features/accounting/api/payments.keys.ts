export const paymentKeys = {
  all: ["payments"] as const,

  lists: (business?: string) =>
    [...paymentKeys.all, "list", business ?? "public"] as const,

  recent: (business: string | undefined, limit: number) =>
    [...paymentKeys.lists(business), "recent", limit] as const,

  unapplied: (
    business: string | undefined,
    payerId: number,
    receiverId: number,
  ) =>
    [...paymentKeys.lists(business), "unapplied", payerId, receiverId] as const,

  byPair: (business: string | undefined, payerId: number, receiverId: number) =>
    [...paymentKeys.lists(business), "by-pair", payerId, receiverId] as const,

  applications: (business: string | undefined, paymentId: number) =>
    [...paymentKeys.lists(business), "applications", paymentId] as const,
};

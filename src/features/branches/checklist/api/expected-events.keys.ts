export const expectedEventsKeys = {
  all: ["branch-expected-events"] as const,
  list: (branchId: number | undefined, from: string | undefined, to: string | undefined) =>
    [...expectedEventsKeys.all, "list", branchId ?? "all", from ?? "", to ?? ""] as const,
};

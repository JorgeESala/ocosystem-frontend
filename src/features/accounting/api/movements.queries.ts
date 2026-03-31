import { useQuery } from "@tanstack/react-query";
import { getMovementsByAccountId } from "./movements.api";
import { accountsPayableMovementKeys } from "./movements.keys";

export const useAccountsPayableMovements = (accountId?: number) => {
  return useQuery({
    queryKey: accountId
      ? accountsPayableMovementKeys.listByAccount(accountId)
      : accountsPayableMovementKeys.all,

    queryFn: () => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      return getMovementsByAccountId(accountId);
    },

    enabled: !!accountId, // importante para cuando el drawer esté cerrado
  });
};

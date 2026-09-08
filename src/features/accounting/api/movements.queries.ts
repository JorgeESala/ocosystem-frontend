import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getMovementsByAccountId } from "./movements.api";
import { accountsPayableMovementKeys } from "./movements.keys";

export const useAccountsPayableMovements = (accountId?: number) => {
  const { slug } = useParams<{ slug: string }>();
  return useQuery({
    queryKey: accountId
      ? accountsPayableMovementKeys.listByAccount(slug, accountId)
      : accountsPayableMovementKeys.lists(slug),

    queryFn: () => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      return getMovementsByAccountId(accountId);
    },

    enabled: !!accountId && !!slug,
  });
};

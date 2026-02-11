import { http } from "@/shared/api/http";
import type { AccountsPayableMovementResponse } from "../types";

export const getMovementsByAccountId = async (
  accountId: number,
): Promise<AccountsPayableMovementResponse[]> => {
  const { data } = await http.get(
    `/api/accounting/accounts-payable-movements/by-accounts-payable/${accountId}`,
  );

  return data;
};

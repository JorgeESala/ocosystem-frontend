import { http } from "@/shared/api/http";
import {
  CreateAccountsPayableRequest,
  AccountsPayableResponse,
} from "../types";

export const createAccountsPayable = (
  payload: CreateAccountsPayableRequest,
) => {
  return http.post<AccountsPayableResponse>(
    "/api/accounting/accounts-payable",
    payload,
  );
};

export const fetchOpenAccounts = (params: {
  debtorId?: number;
  creditorId?: number;
}) => {
  return http.get<AccountsPayableResponse[]>(
    "/api/read/accounts-payable/open",
    {
      params,
    },
  );
};
export const updateAccountsPayableSolicitor = (
  id: number,
  solicitorId: number | null,
) => {
  return http.patch(`/api/accounting/accounts-payable/${id}/solicitor`, {
    solicitorId,
  });
};

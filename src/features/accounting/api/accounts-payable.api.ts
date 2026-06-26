import { http } from "@/shared/api/http";
import {
  CreateAccountsPayableRequest,
  AccountsPayableResponse,
} from "../../live-chicken/accounting/accounts-payable/types";

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
  debtorIds?: number[];
  creditorId?: number;
  creditorOriginalIds?: number[];
  creditorEntityType?: string;
  // --- Nuevos filtros ---
  entityId?: number;
  entityType?: string;
  from?: string;
  to?: string;
}) => {
  return http.get<AccountsPayableResponse[]>(
    "/api/read/accounts-payable/open",
    {
      params,
      paramsSerializer: (p) => {
        const searchParams = new URLSearchParams();

        Object.entries(p).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") return;

          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        });

        return searchParams.toString();
      },
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

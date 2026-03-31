import { http } from "@/shared/api/http";
import { CreditSolicitor } from "../../live-chicken/accounting/accounts-payable/types";

export const fetchSolicitors = (params?: {
  accountingEntityId?: number;
  active?: boolean;
}) => {
  return http.get<CreditSolicitor[]>("/api/accounting/credit-solicitors", {
    params,
  });
};

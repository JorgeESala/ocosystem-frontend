import { http } from "@/shared/api/http";
import type { AccountingEntity, AccountingEntityType } from "../../types";

export const fetchAccountingEntities = (params?: {
  entityType?: AccountingEntityType;
}) => {
  return http.get<AccountingEntity[]>("/api/accounting/entities", { params });
};

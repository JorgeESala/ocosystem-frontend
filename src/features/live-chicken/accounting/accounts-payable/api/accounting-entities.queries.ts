import { useQuery } from "@tanstack/react-query";
import { fetchAccountingEntities } from "./accounting-entities.api";
import { accountingEntityKeys } from "./accounting-entities.keys";
import type { AccountingEntityType } from "../../types";

export const useAccountingEntities = (entityType?: AccountingEntityType) => {
  return useQuery({
    queryKey: accountingEntityKeys.byType(entityType),
    queryFn: () => fetchAccountingEntities({ entityType }).then((r) => r.data),
  });
};

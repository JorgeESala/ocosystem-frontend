import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchAccountingEntities } from "./accounting-entities.api";
import { accountingEntityKeys } from "./accounting-entities.keys";
import type { AccountingEntityType } from "../types/accounting-entity.types";

export const useAccountingEntities = (entityType?: AccountingEntityType) => {
  const { slug } = useParams<{ slug: string }>();
  return useQuery({
    queryKey: accountingEntityKeys.byType(slug, entityType),
    queryFn: () => fetchAccountingEntities({ entityType }).then((r) => r.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

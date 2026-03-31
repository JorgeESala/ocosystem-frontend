import { useQuery } from "@tanstack/react-query";
import { fetchSolicitors } from "./solicitor.api";
import { solicitorKeys } from "./solicitor.keys";

export const useSolicitors = (params?: {
  accountingEntityId?: number;
  active?: boolean;
}) => {
  return useQuery({
    queryKey: params?.accountingEntityId
      ? solicitorKeys.listByEntity(params.accountingEntityId)
      : solicitorKeys.lists(),

    queryFn: () => fetchSolicitors(params).then((r) => r.data),

    enabled: params?.accountingEntityId !== undefined || params === undefined,
  });
};

import { useQuery } from "@tanstack/react-query";
import { fetchSolicitors } from "./solicitor.api";
import { solicitorKeys } from "./solicitor.keys";

export const useSolicitors = (
  business: string,
  params?: {
    accountingEntityId?: number;
    active?: boolean;
  },
) => {
  return useQuery({
    queryKey: params?.accountingEntityId
      ? solicitorKeys.listByEntity(business, params.accountingEntityId)
      : solicitorKeys.lists(business),

    queryFn: () => fetchSolicitors(params).then((r) => r.data),

    enabled: params?.accountingEntityId !== undefined || params === undefined,
  });
};

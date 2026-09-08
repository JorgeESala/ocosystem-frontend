import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchClientStatementSummary } from "./client-summary.api";
import { clientSummaryKeys } from "./client-summary.keys";

export const useClientStatementSummary = (params: {
  debtorEntityId?: number;
  from?: string;
  to?: string;
  enabled?: boolean;
}) => {
  const { slug } = useParams<{ slug: string }>();
  const ready =
    (params.enabled ?? true) &&
    !!slug &&
    params.debtorEntityId != null &&
    !!params.from &&
    !!params.to;
  return useQuery({
    queryKey: clientSummaryKeys.detail(
      slug,
      params.debtorEntityId ?? 0,
      params.from ?? "",
      params.to ?? "",
    ),
    queryFn: () =>
      fetchClientStatementSummary({
        debtorEntityId: params.debtorEntityId!,
        from: params.from!,
        to: params.to!,
      }),
    enabled: ready,
    staleTime: 1000 * 60 * 5,
  });
};

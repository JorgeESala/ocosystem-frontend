import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { ComparisonMode } from "@/core/api/types";
import { getRouteCalendar, getSummary } from "./summary.api";
import { clientsRoutesSummaryKeys } from "./summary.keys";

export const useClientRoutesSummary = (
  from: string | null,
  to: string | null,
  dormantDays: number,
  comparison: ComparisonMode,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientsRoutesSummaryKeys.summary(
      slug,
      from ?? "",
      to ?? "",
      dormantDays,
      comparison,
    ),
    queryFn: () =>
      getSummary(from as string, to as string, dormantDays, comparison),
    enabled: !!slug && !!from && !!to,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRouteCalendar = () => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientsRoutesSummaryKeys.calendar(slug),
    queryFn: getRouteCalendar,
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRouteCalendar, getSummary } from "./summary.api";
import { clientsRoutesSummaryKeys } from "./summary.keys";

export const useClientRoutesSummary = (
  from: string | null,
  to: string | null,
  dormantDays: number,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientsRoutesSummaryKeys.summary(
      slug,
      from ?? "",
      to ?? "",
      dormantDays,
    ),
    queryFn: () => getSummary(from as string, to as string, dormantDays),
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

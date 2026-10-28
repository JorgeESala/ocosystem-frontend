import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  fetchRouteCollections,
  fetchTripCollections,
} from "./collections.api";

export const collectionsKeys = {
  all: ["collections"] as const,
  byRoute: (routeId: number) =>
    [...collectionsKeys.all, "by-route", routeId] as const,
  trips: (
    business: string | undefined,
    from: string,
    to: string,
    routeId: number | null,
  ) =>
    [
      ...collectionsKeys.all,
      "trips",
      business ?? "public",
      from,
      to,
      routeId ?? 0,
    ] as const,
};

export const useRouteCollections = (routeId: number | null) => {
  return useQuery({
    queryKey: collectionsKeys.byRoute(routeId ?? 0),
    queryFn: () => fetchRouteCollections(routeId!),
    enabled: routeId != null && routeId > 0,
    placeholderData: (previousData) => previousData,
  });
};

export const useTripCollections = (
  from: string | null,
  to: string | null,
  routeId: number | null,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: collectionsKeys.trips(
      slug,
      from ?? "",
      to ?? "",
      routeId,
    ),
    queryFn: () => fetchTripCollections(from!, to!, routeId),
    enabled: !!slug && !!from && !!to,
    placeholderData: (previousData) => previousData,
  });
};

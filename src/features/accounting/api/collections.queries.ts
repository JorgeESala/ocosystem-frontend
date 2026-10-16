import { useQuery } from "@tanstack/react-query";
import { fetchRouteCollections } from "./collections.api";

export const collectionsKeys = {
  all: ["collections"] as const,
  byRoute: (routeId: number) =>
    [...collectionsKeys.all, "by-route", routeId] as const,
};

export const useRouteCollections = (routeId: number | null) => {
  return useQuery({
    queryKey: collectionsKeys.byRoute(routeId ?? 0),
    queryFn: () => fetchRouteCollections(routeId!),
    enabled: routeId != null && routeId > 0,
    placeholderData: (previousData) => previousData,
  });
};

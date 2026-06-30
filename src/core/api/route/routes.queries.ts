import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, getRoutes } from "@/core/api/route/route.api";
import { routeKeys } from "@/core/api/route/route.keys";

export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.list(),
    queryFn: getRoutes,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routeKeys.list(),
        exact: true,
      });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoutes, createRoute } from "./routes.api";
import { routeKeys } from "./routes.keys";

export const useRoutes = () =>
  useQuery({
    queryKey: routeKeys.list(),
    queryFn: getRoutes,
  });

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routeKeys.list(),
      });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { localityApi } from "./locality.api";
import { localityKeys } from "./locality.keys";

export const useLocalities = () =>
  useQuery({
    queryKey: localityKeys.list(),
    queryFn: localityApi.getAll,
  });

export const useCreateLocality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: localityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localityKeys.list() });
    },
  });
};

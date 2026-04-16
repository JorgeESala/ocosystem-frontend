import * as api from "@/core/client/api/client.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "./client.keys";

export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: api.getClients,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createClient,
    onSuccess: () => {
      // Esto hace que el selector se refresque mágicamente
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

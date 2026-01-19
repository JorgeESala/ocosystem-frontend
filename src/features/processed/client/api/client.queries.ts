import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "./client.api";
import { clientKeys } from "./client.keys";
import type { ClientCreateDTO, ClientUpdateDTO } from "./client.api";

export const useClients = () =>
  useQuery({
    queryKey: clientKeys.list(),
    queryFn: getClients,
  });

export const useClient = (id: number, enabled = true) =>
  useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientById(id),
    enabled,
  });

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientCreateDTO) => createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.list(),
      });
    },
  });
};

export const useUpdateClient = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientUpdateDTO) => updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(id),
      });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.list(),
      });
    },
  });
};

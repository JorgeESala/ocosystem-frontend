import axios from "axios";
import * as api from "@/core/client/api/client.api";
import type { ClientCreateRequestDTO } from "./client.api";
import type { Client } from "@/core/api/types";
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
    mutationFn: async (
      payload: ClientCreateRequestDTO,
    ): Promise<Client> => {
      try {
        return await api.createClient(payload);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          throw new Error(
            "Ya existe un cliente con ese nombre en esta localidad",
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

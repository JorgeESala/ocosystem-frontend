import axios from "axios";
import * as api from "@/core/client/api/client.api";
import type { ClientCreateRequestDTO } from "./client.api";
import type { Client } from "@/core/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "./client.keys";

const DUPLICATE_MESSAGE =
  "Ya existe un cliente con ese nombre en esta localidad";

const translateClientError = (error: unknown): Error => {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return new Error(DUPLICATE_MESSAGE);
  }
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return new Error("Cliente no encontrado");
  }
  return error instanceof Error ? error : new Error(String(error));
};

export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: api.getClients,
  });
};

export const useClient = (id: number | null) => {
  return useQuery({
    queryKey: clientKeys.details(id ?? 0),
    queryFn: () => api.getClient(id as number),
    enabled: id !== null,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClientCreateRequestDTO): Promise<Client> => {
      try {
        return await api.createClient(payload);
      } catch (error) {
        throw translateClientError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ClientCreateRequestDTO;
    }): Promise<Client> => {
      try {
        return await api.updateClient(id, payload);
      } catch (error) {
        throw translateClientError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      try {
        await api.deleteClient(id);
      } catch (error) {
        throw translateClientError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

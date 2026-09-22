import axios from "axios";
import * as api from "@/core/client/api/client.api";
import type {
  ClientCreateRequestDTO,
  InternalClientCreateRequestDTO,
} from "./client.api";
import type { Client } from "@/core/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
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

export const useClients = (includeInactive = false) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientKeys.list(slug, includeInactive),
    queryFn: () => api.getClients(includeInactive),
    enabled: !!slug,
  });
};

export const useClient = (id: number | null) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientKeys.details(slug, id ?? 0),
    queryFn: () => api.getClient(id as number),
    enabled: !!slug && id !== null,
  });
};

export const useClientPurchases = (
  id: number | null,
  startDate: string | null,
  endDate: string | null,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: clientKeys.purchases(
      slug,
      id ?? 0,
      startDate ?? "",
      endDate ?? "",
    ),
    queryFn: () =>
      api.getClientPurchases(
        id as number,
        startDate as string,
        endDate as string,
      ),
    enabled: !!slug && id !== null && !!startDate && !!endDate,
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

export const useCreateInternalClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: InternalClientCreateRequestDTO,
    ): Promise<Client> => {
      try {
        return await api.createInternalClient(payload);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          return Promise.reject(
            new Error(
              "Los clientes internos no están habilitados en este negocio",
            ),
          );
        }
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

export const useReactivateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Client> => {
      try {
        return await api.reactivateClient(id);
      } catch (error) {
        throw translateClientError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  createRoute,
  deleteRoute,
  getRoute,
  getRoutes,
  updateRoute,
} from "@/core/api/route/route.api";
import type { Route } from "@/core/api/types";
import { routeKeys } from "@/core/api/route/route.keys";

const DUPLICATE_MESSAGE = "Ya existe una ruta con ese nombre";

const translateRouteError = (error: unknown): Error => {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return new Error(DUPLICATE_MESSAGE);
  }
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return new Error("Ruta no encontrada");
  }
  return error instanceof Error ? error : new Error(String(error));
};

export const useRoutes = () => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: routeKeys.list(slug),
    queryFn: getRoutes,
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

export const useRoute = (id: number | null) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: routeKeys.detail(slug, id ?? 0),
    queryFn: () => getRoute(id as number),
    enabled: !!slug && id !== null,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }): Promise<Route> => {
      try {
        return await createRoute(payload);
      } catch (error) {
        throw translateRouteError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { name: string };
    }): Promise<Route> => {
      try {
        return await updateRoute(id, payload);
      } catch (error) {
        throw translateRouteError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      try {
        await deleteRoute(id);
      } catch (error) {
        throw translateRouteError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

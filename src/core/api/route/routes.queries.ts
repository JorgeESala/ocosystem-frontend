import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  createRoute,
  deleteRoute,
  getRoute,
  getRoutePerformance,
  getRoutes,
  reactivateRoute,
  updateRoute,
  type RoutePayload,
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

export const useRoutes = (includeInactive = false) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: includeInactive
      ? routeKeys.listWithInactive(slug)
      : routeKeys.list(slug),
    queryFn: () => getRoutes(includeInactive),
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

export const useRoutePerformance = (
  startDate: string | null,
  endDate: string | null,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: routeKeys.performance(slug, startDate ?? "", endDate ?? ""),
    queryFn: () => getRoutePerformance(startDate as string, endDate as string),
    enabled: !!slug && !!startDate && !!endDate,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RoutePayload): Promise<Route> => {
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
      payload: RoutePayload;
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

export const useReactivateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Route> => {
      try {
        return await reactivateRoute(id);
      } catch (error) {
        throw translateRouteError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
};

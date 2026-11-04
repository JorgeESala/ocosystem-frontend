import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRouteOrdersDay, saveRouteOrder } from "./routeOrders.api";
import { routeOrderKeys } from "./routeOrders.keys";
import {
  getCurrentEggPriceReference,
  getEggPriceReferenceHistory,
  saveEggPriceReference,
} from "./eggPriceReference.api";
import { eggPriceReferenceKeys } from "./eggPriceReference.keys";
import type {
  EggPriceReferenceSaveDTO,
  RouteOrderSaveDTO,
} from "../types/routeOrder.types";

export const useRouteOrdersDay = (date: string) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: routeOrderKeys.day(slug ?? "", date),
    queryFn: () => getRouteOrdersDay(date),
    enabled: !!slug && !!date,
    staleTime: 1000 * 60 * 2,
  });
};

export const useSaveRouteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RouteOrderSaveDTO) => saveRouteOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeOrderKeys.all });
    },
  });
};

export const useEggPriceReference = (date: string, enabled = true) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: eggPriceReferenceKeys.current(slug ?? "", date),
    queryFn: () => getCurrentEggPriceReference(date),
    enabled: enabled && !!slug && !!date,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEggPriceReferenceHistory = (enabled = true) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: eggPriceReferenceKeys.history(slug ?? ""),
    queryFn: getEggPriceReferenceHistory,
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveEggPriceReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EggPriceReferenceSaveDTO) =>
      saveEggPriceReference(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eggPriceReferenceKeys.all });
    },
  });
};

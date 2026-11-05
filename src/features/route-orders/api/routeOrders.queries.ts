import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  createRouteOrderTrip,
  generateRouteOrderSales,
  getRouteOrderSaleCandidates,
  getRouteOrderSheet,
  getRouteOrdersDay,
  linkRouteOrderTrip,
  saveRouteOrder,
  unlinkRouteOrderTrip,
} from "./routeOrders.api";
import { routeOrderKeys } from "./routeOrders.keys";
import {
  getCurrentEggPriceReference,
  getEggPriceReferenceHistory,
  saveEggPriceReference,
} from "./eggPriceReference.api";
import { eggPriceReferenceKeys } from "./eggPriceReference.keys";
import type {
  EggPriceReferenceSaveDTO,
  GenerateRouteOrderSalesDTO,
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

export const useRouteOrderSheet = (
  routeId: number | null,
  date: string | null,
  enabled = true,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey:
      routeId != null && date
        ? routeOrderKeys.sheet(slug ?? "", routeId, date)
        : [],
    queryFn: () => getRouteOrderSheet(routeId!, date!),
    enabled: enabled && !!slug && routeId != null && !!date,
    staleTime: 1000 * 60,
  });
};

export const useRouteOrderSaleCandidates = (
  date: string | null,
  enabled = true,
) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: date
      ? routeOrderKeys.saleCandidatesByDate(slug ?? "", date)
      : routeOrderKeys.saleCandidates(),
    queryFn: () => getRouteOrderSaleCandidates(date!),
    enabled: enabled && !!slug && !!date,
    staleTime: 1000 * 30,
  });
};

export const useGenerateRouteOrderSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateRouteOrderSalesDTO) =>
      generateRouteOrderSales(payload),
    onSuccess: () => {
      invalidateRouteOrders(queryClient);
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
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

const invalidateRouteOrders = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: routeOrderKeys.all });
};

export const useCreateRouteOrderTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => createRouteOrderTrip(orderId),
    onSuccess: () => invalidateRouteOrders(queryClient),
  });
};

export const useLinkRouteOrderTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, tripId }: { orderId: number; tripId: number }) =>
      linkRouteOrderTrip(orderId, tripId),
    onSuccess: () => invalidateRouteOrders(queryClient),
  });
};

export const useUnlinkRouteOrderTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => unlinkRouteOrderTrip(orderId),
    onSuccess: () => invalidateRouteOrders(queryClient),
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

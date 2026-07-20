import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CashFlowFrequency,
  CreateCashAdjustmentDTO,
  CreateCashReserveDTO,
  UpdateCashAdjustmentDTO,
  UpdateCashReserveDTO,
} from "../types";
import { cashReserveApi, cashAdjustmentApi } from "./cashReserve.api";
import { cashReserveKeys } from "./cashReserve.keys";

export const useCashReserves = () =>
  useQuery({
    queryKey: cashReserveKeys.list(),
    queryFn: () => cashReserveApi.getAll(),
  });

export const useCashReserve = (id: number | null) =>
  useQuery({
    queryKey: id ? cashReserveKeys.detail(id) : [...cashReserveKeys.all, "disabled"],
    queryFn: () => cashReserveApi.getById(id!),
    enabled: Boolean(id),
  });

export const useCashFlow = (
  id: number | null,
  start: Date | null,
  end: Date | null,
  frequency: CashFlowFrequency,
) =>
  useQuery({
    queryKey:
      id && start && end
        ? cashReserveKeys.flow(
            id,
            start.toISOString(),
            end.toISOString(),
            frequency,
          )
        : [...cashReserveKeys.all, "flow", "disabled"],
    queryFn: () => cashReserveApi.getFlow(id!, start!, end!, frequency),
    enabled: Boolean(id && start && end),
  });

export const useGlobalCashFlow = (
  start: Date | null,
  end: Date | null,
  frequency: CashFlowFrequency,
) =>
  useQuery({
    queryKey:
      start && end
        ? cashReserveKeys.flow(
            0,
            start.toISOString(),
            end.toISOString(),
            frequency,
          )
        : [...cashReserveKeys.all, "flow", "disabled"],
    queryFn: () => cashReserveApi.getGlobalFlow(start!, end!, frequency),
    enabled: Boolean(start && end),
  });

export const useCashReserveAlerts = () =>
  useQuery({
    queryKey: cashReserveKeys.alerts(),
    queryFn: () => cashReserveApi.getAlerts(),
  });

export const useCashFlowHistory = (
  id: number | null,
  start: Date | null,
  end: Date | null,
) =>
  useQuery({
    queryKey:
      id && start && end
        ? ["cash-reserve", "history", id, start.toISOString(), end.toISOString()]
        : ["cash-reserve", "history", "disabled"],
    queryFn: () => cashReserveApi.getHistory(id!, start!, end!),
    enabled: Boolean(id && start && end),
  });

export const useCreateCashReserve = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashReserveDTO) =>
      cashReserveApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
    },
  });
};

export const useUpdateCashReserve = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCashReserveDTO }) =>
      cashReserveApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
    },
  });
};

export const useRecalculateCashReserve = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cashReserveApi.recalculate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
    },
  });
};

export const useRecalculateAllCashReserves = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cashReserveApi.recalculateAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
    },
  });
};

export const useCashAdjustments = (
  branchId: number | null,
  start: Date | null,
  end: Date | null,
) =>
  useQuery({
    queryKey:
      branchId && start && end
        ? ["cash-adjustment", branchId, start.toISOString(), end.toISOString()]
        : ["cash-adjustment", "disabled"],
    queryFn: () => cashAdjustmentApi.getByBranch(branchId!, start!, end!),
    enabled: Boolean(branchId && start && end),
  });

export const useCreateCashAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashAdjustmentDTO) =>
      cashAdjustmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
      queryClient.invalidateQueries({ queryKey: ["cash-adjustment"] });
    },
  });
};

export const useUpdateCashAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCashAdjustmentDTO }) =>
      cashAdjustmentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
      queryClient.invalidateQueries({ queryKey: ["cash-adjustment"] });
    },
  });
};

export const useDeleteCashAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cashAdjustmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashReserveKeys.all });
      queryClient.invalidateQueries({ queryKey: ["cash-adjustment"] });
    },
  });
};

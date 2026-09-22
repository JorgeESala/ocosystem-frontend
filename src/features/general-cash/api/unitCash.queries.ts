import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateUnitCashAdjustmentDTO,
  CreateUnitCashDTO,
  UnitCashFrequency,
  UnitCashUnit,
  UpdateUnitCashAdjustmentDTO,
  UpdateUnitCashDTO,
} from "../types.unit";
import { unitCashApi } from "./unitCash.api";
import { unitCashKeys } from "./unitCash.keys";

export const useUnitCashAccount = (unit: UnitCashUnit) =>
  useQuery({
    queryKey: unitCashKeys(unit).account(),
    queryFn: () => unitCashApi.getAccount(),
  });

export const useUnitCashFlow = (
  unit: UnitCashUnit,
  start: Date | null,
  end: Date | null,
  frequency: UnitCashFrequency,
) =>
  useQuery({
    queryKey:
      start && end
        ? unitCashKeys(unit).flow(
            start.toISOString(),
            end.toISOString(),
            frequency,
          )
        : ([...unitCashKeys(unit).all, "flow", "disabled"] as const),
    queryFn: () => unitCashApi.getFlow(start!, end!, frequency),
    enabled: Boolean(start && end),
  });

export const useUnitCashHistory = (
  unit: UnitCashUnit,
  start: Date | null,
  end: Date | null,
) =>
  useQuery({
    queryKey:
      start && end
        ? unitCashKeys(unit).history(start.toISOString(), end.toISOString())
        : ([...unitCashKeys(unit).all, "history", "disabled"] as const),
    queryFn: () => unitCashApi.getHistory(start!, end!),
    enabled: Boolean(start && end),
  });

export const useUnitCashAlerts = (unit: UnitCashUnit) =>
  useQuery({
    queryKey: unitCashKeys(unit).alerts(),
    queryFn: () => unitCashApi.getAlerts(),
  });

export const useUnitCashAdjustments = (
  unit: UnitCashUnit,
  start: Date | null,
  end: Date | null,
) =>
  useQuery({
    queryKey:
      start && end
        ? unitCashKeys(unit).adjustments(start.toISOString(), end.toISOString())
        : ([...unitCashKeys(unit).all, "adjustments", "disabled"] as const),
    queryFn: () => unitCashApi.getAdjustments(start!, end!),
    enabled: Boolean(start && end),
  });

const useInvalidate = (unit: UnitCashUnit) => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: unitCashKeys(unit).all });
};

export const useCreateUnitCash = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateUnitCashDTO) => unitCashApi.create(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateUnitCash = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: UpdateUnitCashDTO) => unitCashApi.update(payload),
    onSuccess: invalidate,
  });
};

export const useRecalculateUnitCash = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: () => unitCashApi.recalculate(),
    onSuccess: invalidate,
  });
};

export const useCreateUnitCashAdjustment = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateUnitCashAdjustmentDTO) =>
      unitCashApi.createAdjustment(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateUnitCashAdjustment = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUnitCashAdjustmentDTO;
    }) => unitCashApi.updateAdjustment(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteUnitCashAdjustment = (unit: UnitCashUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (id: number) => unitCashApi.deleteAdjustment(id),
    onSuccess: invalidate,
  });
};

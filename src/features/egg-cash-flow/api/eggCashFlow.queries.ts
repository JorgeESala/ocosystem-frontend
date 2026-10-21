import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eggCashFlowApi } from "./eggCashFlow.api";
import { eggCashFlowKeys } from "./eggCashFlow.keys";
import type {
  CreateAdjustmentRequestDTO,
  CreateCashExpenseRequestDTO,
  CreateCashFlowCutDTO,
  CreateCashFlowSettingsDTO,
  CreateDepositRequestDTO,
  CreateIncomeRequestDTO,
  CreateRemesaPaymentRequestDTO,
  EggCashFlowUnit,
  UpdateCashFlowSettingsDTO,
} from "../types/eggCashFlow.types";

const STALE_TIME = 30_000;

export const useCashFlowSettings = (unit: EggCashFlowUnit) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).settings(),
    queryFn: () => eggCashFlowApi.getSettings(),
    staleTime: STALE_TIME,
  });

export const useCashFlowSummary = (
  unit: EggCashFlowUnit,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).summary(from, to),
    queryFn: () => eggCashFlowApi.getSummary(from, to),
    staleTime: STALE_TIME,
  });

export const useCashFlowMovements = (
  unit: EggCashFlowUnit,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).movements(from, to),
    queryFn: () => eggCashFlowApi.getMovements(from, to),
    staleTime: STALE_TIME,
  });

export const useTripSuggestions = (
  unit: EggCashFlowUnit,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).tripSuggestions(from, to),
    queryFn: () => eggCashFlowApi.getTripSuggestions(from, to),
    staleTime: STALE_TIME,
  });

export const useCollectionSuggestions = (
  unit: EggCashFlowUnit,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).collectionSuggestions(from, to),
    queryFn: () => eggCashFlowApi.getCollectionSuggestions(from, to),
    staleTime: STALE_TIME,
  });

export const useRemesas = (unit: EggCashFlowUnit) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).remesas(),
    queryFn: () => eggCashFlowApi.getRemesas(),
    staleTime: STALE_TIME,
  });

export const useAvailableExpenses = (
  unit: EggCashFlowUnit,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).availableExpenses(from, to),
    queryFn: () => eggCashFlowApi.getAvailableExpenses(from, to),
    staleTime: STALE_TIME,
  });

export const useCashFlowCuts = (unit: EggCashFlowUnit) =>
  useQuery({
    queryKey: eggCashFlowKeys(unit).cuts(),
    queryFn: () => eggCashFlowApi.getCuts(),
    staleTime: STALE_TIME,
  });

const useInvalidate = (unit: EggCashFlowUnit) => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: eggCashFlowKeys(unit).all });
};

export const useCreateCashFlowSettings = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateCashFlowSettingsDTO) =>
      eggCashFlowApi.createSettings(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateCashFlowSettings = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: UpdateCashFlowSettingsDTO) =>
      eggCashFlowApi.updateSettings(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowIncome = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateIncomeRequestDTO) =>
      eggCashFlowApi.createIncome(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowDeposit = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateDepositRequestDTO) =>
      eggCashFlowApi.createDeposit(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowExpense = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateCashExpenseRequestDTO) =>
      eggCashFlowApi.createCashExpense(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowRemesaPayment = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateRemesaPaymentRequestDTO) =>
      eggCashFlowApi.createRemesaPayment(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowAdjustment = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateAdjustmentRequestDTO) =>
      eggCashFlowApi.createAdjustment(payload),
    onSuccess: invalidate,
  });
};

export const useDeleteCashFlowMovement = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (id: number) => eggCashFlowApi.deleteMovement(id),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowCut = (unit: EggCashFlowUnit) => {
  const invalidate = useInvalidate(unit);
  return useMutation({
    mutationFn: (payload: CreateCashFlowCutDTO) =>
      eggCashFlowApi.createCut(payload),
    onSuccess: invalidate,
  });
};

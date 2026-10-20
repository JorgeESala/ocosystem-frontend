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
  UpdateCashFlowSettingsDTO,
} from "../types/eggCashFlow.types";

export const useCashFlowSettings = () =>
  useQuery({
    queryKey: eggCashFlowKeys.settings(),
    queryFn: () => eggCashFlowApi.getSettings(),
  });

export const useCashFlowSummary = (from: string, to: string) =>
  useQuery({
    queryKey: eggCashFlowKeys.summary(from, to),
    queryFn: () => eggCashFlowApi.getSummary(from, to),
  });

export const useCashFlowMovements = (from: string, to: string) =>
  useQuery({
    queryKey: eggCashFlowKeys.movements(from, to),
    queryFn: () => eggCashFlowApi.getMovements(from, to),
  });

export const useTripSuggestions = (from: string, to: string) =>
  useQuery({
    queryKey: eggCashFlowKeys.tripSuggestions(from, to),
    queryFn: () => eggCashFlowApi.getTripSuggestions(from, to),
  });

export const useCollectionSuggestions = (from: string, to: string) =>
  useQuery({
    queryKey: eggCashFlowKeys.collectionSuggestions(from, to),
    queryFn: () => eggCashFlowApi.getCollectionSuggestions(from, to),
  });

export const useRemesas = () =>
  useQuery({
    queryKey: eggCashFlowKeys.remesas(),
    queryFn: () => eggCashFlowApi.getRemesas(),
  });

export const useAvailableExpenses = (from: string, to: string) =>
  useQuery({
    queryKey: eggCashFlowKeys.availableExpenses(from, to),
    queryFn: () => eggCashFlowApi.getAvailableExpenses(from, to),
  });

export const useCashFlowCuts = () =>
  useQuery({
    queryKey: eggCashFlowKeys.cuts(),
    queryFn: () => eggCashFlowApi.getCuts(),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: eggCashFlowKeys.all });
};

export const useCreateCashFlowSettings = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateCashFlowSettingsDTO) =>
      eggCashFlowApi.createSettings(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateCashFlowSettings = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: UpdateCashFlowSettingsDTO) =>
      eggCashFlowApi.updateSettings(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowIncome = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateIncomeRequestDTO) =>
      eggCashFlowApi.createIncome(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowDeposit = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateDepositRequestDTO) =>
      eggCashFlowApi.createDeposit(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowExpense = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateCashExpenseRequestDTO) =>
      eggCashFlowApi.createCashExpense(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowRemesaPayment = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateRemesaPaymentRequestDTO) =>
      eggCashFlowApi.createRemesaPayment(payload),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowAdjustment = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateAdjustmentRequestDTO) =>
      eggCashFlowApi.createAdjustment(payload),
    onSuccess: invalidate,
  });
};

export const useDeleteCashFlowMovement = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => eggCashFlowApi.deleteMovement(id),
    onSuccess: invalidate,
  });
};

export const useCreateCashFlowCut = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CreateCashFlowCutDTO) =>
      eggCashFlowApi.createCut(payload),
    onSuccess: invalidate,
  });
};

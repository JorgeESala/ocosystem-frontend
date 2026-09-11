import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  applyCreditsToAccount,
  applyRemainder,
  cancelPayment,
  createAdvancePayment,
  createCompensationPaymentFromAP,
  createFifoPayment,
  createPayment,
  fetchPaymentApplications,
  fetchRecentPayments,
  fetchUnappliedPayments,
  previewFifoPayment,
  reverseApplication,
  type ApplyRemainderPayload,
} from "./payments.api";
import { paymentKeys } from "./payments.keys";
import { accountsPayableKeys } from "./accounts-payable.keys";
import { accountsPayableMovementKeys } from "./movements.keys";
import { clientSummaryKeys } from "./client-summary.keys";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};

export const useCreateCompensationPaymentFromAP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompensationPaymentFromAP,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};
export const useCancelPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => invalidateAccountingCaches(queryClient),
  });
};

export const useCreateFifoPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFifoPayment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};

export const usePreviewFifoPayment = () => {
  return useMutation({
    mutationFn: previewFifoPayment,
  });
};

export const useCreateAdvancePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvancePayment,
    onSuccess: () => invalidateAccountingCaches(queryClient),
  });
};

export const useRecentPayments = (limit = 20) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: paymentKeys.recent(slug, limit),
    queryFn: () => fetchRecentPayments(limit),
    enabled: !!slug,
    staleTime: 1000 * 30,
  });
};

export const useUnappliedPayments = (payerId?: number, receiverId?: number) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: paymentKeys.unapplied(slug, payerId ?? 0, receiverId ?? 0),
    queryFn: () => fetchUnappliedPayments(payerId!, receiverId!),
    enabled: !!slug && !!payerId && !!receiverId,
    staleTime: 1000 * 30,
  });
};

const invalidateAccountingCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
  queryClient.invalidateQueries({
    queryKey: accountsPayableMovementKeys.all,
  });
  queryClient.invalidateQueries({ queryKey: clientSummaryKeys.all });
};

export const useReverseApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      movementId,
      reason,
    }: {
      movementId: number;
      reason: string;
    }) => reverseApplication(movementId, reason),
    onSuccess: () => invalidateAccountingCaches(queryClient),
  });
};

export const useApplyRemainder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: number;
      payload: ApplyRemainderPayload;
    }) => applyRemainder(paymentId, payload),
    onSuccess: () => invalidateAccountingCaches(queryClient),
  });
};

export const usePaymentApplications = (paymentId?: number) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: paymentKeys.applications(slug, paymentId ?? 0),
    queryFn: () => fetchPaymentApplications(paymentId!),
    enabled: !!slug && !!paymentId,
    staleTime: 1000 * 30,
  });
};

export const useApplyCreditsToAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyCreditsToAccount,
    onSuccess: () => invalidateAccountingCaches(queryClient),
  });
};

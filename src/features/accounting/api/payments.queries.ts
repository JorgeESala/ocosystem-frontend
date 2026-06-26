import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  cancelPayment,
  createCompensationPaymentFromAP,
  createPayment,
  fetchRecentPayments,
} from "./payments.api";
import { paymentKeys } from "./payments.keys";
import { accountsPayableKeys } from "./accounts-payable.keys";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
    },
  });
};

export const useRecentPayments = (limit = 20) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: paymentKeys.recent(limit),
    queryFn: () => fetchRecentPayments(limit),
    enabled: !!slug,
    staleTime: 1000 * 30,
  });
};

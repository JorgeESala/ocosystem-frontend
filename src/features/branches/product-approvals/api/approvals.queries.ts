import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as approvalsApi from "./approvals.api";
import { approvalKeys } from "./approvals.keys";
import type { ApproveProductPayload } from "../types";

export const usePendingProducts = () => {
  return useQuery({
    queryKey: approvalKeys.pending(),
    queryFn: approvalsApi.getPendingProducts,
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      barcode,
      payload,
    }: {
      barcode: string;
      payload: ApproveProductPayload;
    }) => approvalsApi.approveProduct(barcode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() });
    },
  });
};

export const useApiKeys = () => {
  return useQuery({
    queryKey: approvalKeys.apiKeys(),
    queryFn: approvalsApi.getApiKeys,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalsApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.apiKeys() });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalsApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.apiKeys() });
    },
  });
};
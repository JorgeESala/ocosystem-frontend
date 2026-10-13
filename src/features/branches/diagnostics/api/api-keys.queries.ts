import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as apiKeysApi from "./api-keys.api";
import { apiKeyKeys } from "./api-keys.keys";

export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: apiKeysApi.getApiKeys,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiKeysApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiKeysApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
};

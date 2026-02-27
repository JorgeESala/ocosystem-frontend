import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccountsPayable,
  fetchOpenAccounts,
  updateAccountsPayableSolicitor,
} from "./accounts-payable.api";
import { accountsPayableKeys } from "./accounts-payable.keys";

export const useCreateAccountsPayable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountsPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};

export const useOpenAccounts = (params: {
  debtorId?: number;
  creditorId?: number;
}) => {
  return useQuery({
    queryKey: accountsPayableKeys.open(params),
    queryFn: () => fetchOpenAccounts(params).then((r) => r.data),
  });
};
export const useUpdateAccountsPayableSolicitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      solicitorId,
    }: {
      id: number;
      solicitorId: number | null;
    }) => updateAccountsPayableSolicitor(id, solicitorId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};

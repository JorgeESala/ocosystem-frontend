import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccountsPayable,
  fetchOpenAccounts,
} from "./accounts-payable.api";
import { accountsPayableKeys } from "./accounts-payable.keys";

export const useCreateAccountsPayable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountsPayable,
    onSuccess: () => {
      // refresca cualquier listado de cuentas por pagar
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

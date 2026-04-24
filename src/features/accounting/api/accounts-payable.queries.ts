import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccountsPayable,
  fetchOpenAccounts,
  updateAccountsPayableSolicitor,
} from "./accounts-payable.api";
import { accountsPayableKeys } from "./accounts-payable.keys";
import { useParams } from "react-router-dom";

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
  debtorIds?: number[];
  creditorIds?: number[];
  creditorId?: number;
  debtorOriginalIds?: number[];
  debtorEntityType?: string;
  creditorOriginalIds?: number[];
  creditorEntityType?: string;
}) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    // La queryKey ya recibe el objeto params completo,
    // así que los nuevos filtros ya están "protegidos" en el caché.
    queryKey: accountsPayableKeys.open(slug!, params),

    queryFn: () => fetchOpenAccounts(params).then((r) => r.data),

    enabled: !!slug,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
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

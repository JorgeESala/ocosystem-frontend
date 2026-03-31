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
  debtorIds?: number[]; // Soportamos la lista de sucursales
  creditorId?: number;
}) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    // La queryKey ahora rastrea cambios en el array debtorIds
    queryKey: accountsPayableKeys.open(slug!, params),

    queryFn: () => fetchOpenAccounts(params).then((r) => r.data),

    // Solo se dispara si tenemos el slug del tenant
    enabled: !!slug,

    // Mantenemos los datos anteriores mientras cargamos los nuevos para evitar parpadeos
    placeholderData: (previousData) => previousData,

    // Opcional: Refrescar cada vez que el usuario vuelve a la pestaña
    staleTime: 1000 * 60 * 5, // 5 minutos de validez
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPayment } from "./payments.api";
import { paymentKeys } from "./payments.keys";
import { accountsPayableKeys } from "../../accounts-payable/api/accounts-payable.keys";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,

    onSuccess: () => {
      // Refresca pagos (si hay vistas de pagos)
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
      });

      // MUY IMPORTANTE:
      // refresca las cuentas abiertas
      queryClient.invalidateQueries({
        queryKey: accountsPayableKeys.all,
      });
    },
  });
};

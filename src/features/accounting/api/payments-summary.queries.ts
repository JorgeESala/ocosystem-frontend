import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  fetchPaymentsSummary,
  type PaymentsSummaryParams,
} from "./payments-summary.api";
import { paymentKeys } from "./payments.keys";

export const usePaymentsSummary = (params: PaymentsSummaryParams | null) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: paymentKeys.summary(
      slug,
      params?.from ?? "",
      params?.to ?? "",
      params?.receiverType ?? "",
      params?.receiverEntityIds,
      params?.payerEntityIds,
    ),
    queryFn: () => fetchPaymentsSummary(params!),
    enabled: !!slug && !!params,
    placeholderData: (previousData) => previousData,
  });
};

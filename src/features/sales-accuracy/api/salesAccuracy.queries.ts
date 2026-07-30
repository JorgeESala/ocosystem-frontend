import { useQuery } from "@tanstack/react-query";
import { salesAccuracyApi } from "./salesAccuracy.api";

export const salesAccuracyKeys = {
  all: ["sales-accuracy"] as const,
  monthly: (month: string) => [...salesAccuracyKeys.all, month] as const,
};

export const useMonthlyAccuracy = (month: string) =>
  useQuery({
    queryKey: salesAccuracyKeys.monthly(month),
    queryFn: () => salesAccuracyApi.getMonthlyAccuracy(month),
    enabled: !!month,
  });

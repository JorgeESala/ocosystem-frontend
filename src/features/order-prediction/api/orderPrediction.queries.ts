import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateDeliveryScheduleDTO } from "../types";
import { deliveryScheduleApi, orderPredictionApi } from "./orderPrediction.api";
import { orderPredictionKeys } from "./orderPrediction.keys";

export const useDeliverySchedules = () =>
  useQuery({
    queryKey: orderPredictionKeys.schedules(),
    queryFn: () => deliveryScheduleApi.getAll(),
  });

export const useUpdateDeliverySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchId,
      payload,
    }: {
      branchId: number;
      payload: UpdateDeliveryScheduleDTO;
    }) => deliveryScheduleApi.upsert(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderPredictionKeys.all,
      });
    },
  });
};

export const useOrderPredictions = () =>
  useQuery({
    queryKey: orderPredictionKeys.predictions(),
    queryFn: () => orderPredictionApi.getAll(),
  });

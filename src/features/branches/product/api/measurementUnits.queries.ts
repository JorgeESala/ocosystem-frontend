import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { measurementUnitKeys } from "./measurementUnits.keys";
import * as api from "./measurementUnits.api";

// 🔵 GET
export const useMeasurementUnits = () => {
  return useQuery({
    queryKey: measurementUnitKeys.lists(),
    queryFn: api.getMeasurementUnits,
  });
};

// 🟠 CREATE
export const useCreateMeasurementUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: measurementUnitKeys.all,
      });
    },
  });
};

// 🟠 UPDATE
export const useUpdateMeasurementUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string } }) =>
      api.updateMeasurementUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: measurementUnitKeys.all,
      });
    },
  });
};

// 🟠 DELETE
export const useDeleteMeasurementUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: measurementUnitKeys.all,
      });
    },
  });
};

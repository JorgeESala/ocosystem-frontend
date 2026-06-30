import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripApi } from "./trips.api";
import { tripKeys } from "./trips.keys";
import type {
  TripCreateRequestDTO,
  TripSaleDTO,
  TripSummaryDTO,
  TripUpdateRequestDTO,
  TripsUnitType,
} from "../types/trip.types";

export const useTripsForBatch = (
  unitType: TripsUnitType,
  batchId: number | null,
) =>
  useQuery<TripSummaryDTO[]>({
    queryKey: batchId ? tripKeys(unitType).byBatch(batchId) : [],
    queryFn: () => tripApi.getByBatch(batchId!),
    enabled: Boolean(batchId),
  });

export const useTripSales = (
  unitType: TripsUnitType,
  tripId: number | null,
  options?: { enabled?: boolean },
) =>
  useQuery<TripSaleDTO[]>({
    queryKey: tripId ? tripKeys(unitType).sales(tripId) : [],
    queryFn: () => tripApi.getSalesForTrip(tripId!),
    enabled: (options?.enabled ?? true) && Boolean(tripId),
  });

export const useCreateTrip = (unitType: TripsUnitType) => {
  const queryClient = useQueryClient();
  const keys = tripKeys(unitType);

  return useMutation({
    mutationFn: (payload: TripCreateRequestDTO) => tripApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};

export const useUpdateTrip = (unitType: TripsUnitType) => {
  const queryClient = useQueryClient();
  const keys = tripKeys(unitType);

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TripUpdateRequestDTO;
    }) => tripApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChickenLosses,
  createChickenLoss,
  updateChickenLoss,
} from "../api/chickenLoss.api";
import { CHICKEN_LOSS_KEYS } from "./chickenLoss.keys";
import { ChickenLoss } from "../types/chickenLoss.types";

// =====================
// QUERIES
// =====================
export const useChickenLosses = () =>
  useQuery({
    queryKey: CHICKEN_LOSS_KEYS.list(),
    queryFn: fetchChickenLosses,
  });

// =====================
// MUTATIONS
// =====================
export const useCreateChickenLoss = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChickenLoss,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHICKEN_LOSS_KEYS.list(),
      });
    },
  });
};

export const useUpdateChickenLoss = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChickenLoss }) =>
      updateChickenLoss(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHICKEN_LOSS_KEYS.list(),
      });
      queryClient.invalidateQueries({
        queryKey: CHICKEN_LOSS_KEYS.detail(variables.id),
      });
    },
  });
};

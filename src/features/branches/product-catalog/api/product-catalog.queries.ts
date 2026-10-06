import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProductPayload } from "../types";
import { productCatalogApi } from "./product-catalog.api";
import { productCatalogKeys } from "./product-catalog.keys";

export const useProductCatalog = () =>
  useQuery({
    queryKey: productCatalogKeys.list(),
    queryFn: productCatalogApi.list,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productCatalogApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.all });
    },
  });
};

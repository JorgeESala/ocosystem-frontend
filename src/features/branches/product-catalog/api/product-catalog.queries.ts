import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProductPayload, UpdateProductPayload } from "../types";
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
    mutationFn: (payload: CreateProductPayload) =>
      productCatalogApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      barcode,
      payload,
    }: {
      barcode: string;
      payload: UpdateProductPayload;
    }) => productCatalogApi.update(barcode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.all });
      queryClient.invalidateQueries({ queryKey: ["productAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
    },
  });
};

export const useLinkProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetBarcode,
      barcodes,
    }: {
      targetBarcode: string;
      barcodes: string[];
    }) => productCatalogApi.link(targetBarcode, barcodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.all });
      queryClient.invalidateQueries({ queryKey: ["productAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
    },
  });
};

export const useUnlinkProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (barcode: string) => productCatalogApi.unlink(barcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.all });
      queryClient.invalidateQueries({ queryKey: ["productAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["salesReports"] });
    },
  });
};

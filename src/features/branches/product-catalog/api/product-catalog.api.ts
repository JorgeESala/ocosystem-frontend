import { http } from "@/shared/api/http";
import type {
  CatalogProductRow,
  CreateProductPayload,
  ProductCanonical,
  UpdateProductPayload,
} from "../types";
import { isTestRow } from "../utils/catalog-filter";

interface RawProduct {
  barcode: string;
  name: string;
  description?: string | null;
  status?: string | null;
  sku?: string | null;
  isCanonical?: boolean | null;
  category?: { id: number; name: string } | null;
  measurement_unit?: { id: number; name: string } | null;
}

export const productCatalogApi = {
  list: async (): Promise<CatalogProductRow[]> => {
    const { data } = await http.get<RawProduct[]>("/api/products");
    return data
      .filter(
        (product) => !isTestRow(product.barcode) && !isTestRow(product.name),
      )
      .map((product) => ({
        barcode: product.barcode,
        name: product.name,
        categoryName: product.category?.name ?? null,
        unitName: product.measurement_unit?.name ?? null,
        status: product.status ?? null,
        sku: product.sku || product.barcode,
        isCanonical: product.isCanonical !== false,
        description: product.description ?? null,
        categoryId: product.category?.id ?? null,
        unitId: product.measurement_unit?.id ?? null,
      }));
  },

  create: async (payload: CreateProductPayload): Promise<void> => {
    await http.post("/api/products", payload);
  },

  update: async (
    barcode: string,
    payload: UpdateProductPayload,
  ): Promise<void> => {
    await http.put(`/api/products/${encodeURIComponent(barcode)}`, payload);
  },

  link: async (
    targetBarcode: string,
    barcodes: string[],
  ): Promise<ProductCanonical> => {
    const { data } = await http.post<ProductCanonical>("/api/products/link", {
      targetBarcode,
      barcodes,
    });
    return data;
  },

  unlink: async (barcode: string): Promise<ProductCanonical> => {
    const { data } = await http.post<ProductCanonical>(
      `/api/products/${encodeURIComponent(barcode)}/unlink`,
    );
    return data;
  },
};

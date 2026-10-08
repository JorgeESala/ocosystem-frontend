import { http } from "@/shared/api/http";
import type {
  CatalogProductRow,
  CreateProductPayload,
  ProductGroup,
} from "../types";
import { isTestRow } from "../utils/catalog-filter";

interface RawProduct {
  barcode: string;
  name: string;
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
      }));
  },

  create: async (payload: CreateProductPayload): Promise<void> => {
    await http.post("/api/products", payload);
  },

  link: async (
    targetBarcode: string,
    barcodes: string[],
  ): Promise<ProductGroup> => {
    const { data } = await http.post<ProductGroup>("/api/products/link", {
      targetBarcode,
      barcodes,
    });
    return data;
  },

  unlink: async (barcode: string): Promise<ProductGroup> => {
    const { data } = await http.post<ProductGroup>(
      `/api/products/${encodeURIComponent(barcode)}/unlink`,
    );
    return data;
  },
};

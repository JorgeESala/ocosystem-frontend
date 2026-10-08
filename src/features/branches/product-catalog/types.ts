export interface CatalogCategory {
  id: number;
  name: string;
}

export interface CatalogUnit {
  id: number;
  name: string;
}

export interface CatalogProductRow {
  barcode: string;
  name: string;
  categoryName: string | null;
  unitName: string | null;
  status: string | null;
  /** Stable group key shared by every variant of this product. */
  sku: string;
  /** True when this row owns the group (its name/category win in reports). */
  isCanonical: boolean;
}

export interface ProductGroupVariant {
  barcode: string;
  name: string;
  status: string | null;
  categoryName: string | null;
  isCanonical: boolean;
}

export interface ProductGroup {
  sku: string;
  canonicalBarcode: string;
  canonicalName: string;
  variants: ProductGroupVariant[];
}

export interface CreateProductPayload {
  barcode: string;
  name: string;
  categoryId: number;
  unitId: number;
}

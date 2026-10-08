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
  /** Stable key shared by every code of this product. */
  sku: string;
  /** True when this row is the principal code (its name/category win in reports). */
  isCanonical: boolean;
}

export interface ProductCanonicalMember {
  barcode: string;
  name: string;
  status: string | null;
  categoryName: string | null;
  isCanonical: boolean;
}

export interface ProductCanonical {
  sku: string;
  canonicalBarcode: string;
  canonicalName: string;
  members: ProductCanonicalMember[];
}

export interface CreateProductPayload {
  barcode: string;
  name: string;
  categoryId: number;
  unitId: number;
}

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
}

export interface CreateProductPayload {
  barcode: string;
  name: string;
  categoryId: number;
  unitId: number;
}

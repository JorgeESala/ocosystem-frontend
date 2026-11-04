import type { Route } from "@/core/api/types";
import type {
  RouteDetailClient,
  RouteDetailLocality,
} from "@/core/api/route/route.api";

export type RouteOrderUnitType = "EGG" | "LIVE_CHICKEN";

export interface RouteOrderLineDTO {
  id: number | null;
  clientId: number | null;
  clientName: string;
  businessName?: string | null;
  localityName?: string | null;
  quantity: number;
  unitPrice: number;
  vegetables?: string | null;
  condiments?: string | null;
  groceries?: string | null;
  comments?: string | null;
  sortOrder: number;
}

export interface RouteOrderDTO {
  id: number | null;
  routeId: number;
  orderDate: string;
  driverName?: string | null;
  vehicleName?: string | null;
  notes?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lines: RouteOrderLineDTO[];
}

export interface RouteOrderSheetDTO {
  date: string;
  route: Route;
  localities: RouteDetailLocality[];
  clients: RouteDetailClient[];
  order: RouteOrderDTO;
}

export interface RouteOrderLineSaveDTO {
  clientId: number;
  quantity: number;
  unitPrice: number;
  vegetables?: string | null;
  condiments?: string | null;
  groceries?: string | null;
  comments?: string | null;
  sortOrder: number;
}

export interface RouteOrderSaveDTO {
  routeId: number;
  orderDate: string;
  driverName?: string | null;
  vehicleName?: string | null;
  notes?: string | null;
  lines: RouteOrderLineSaveDTO[];
}

export interface EggPriceReferenceDTO {
  id: number;
  pricePerCarton: number;
  pricePerBox: number;
  effectiveFrom: string;
  notes?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EggPriceReferenceSaveDTO {
  pricePerCarton: number;
  effectiveFrom: string;
  notes?: string | null;
}

export interface RouteOrderDraftRow {
  key: string;
  clientId: number;
  clientName: string;
  businessName: string;
  localityName: string;
  quantity: string;
  unitPrice: string;
  lastSalePricePerCarton?: number | null;
  lastSalePricePerKg?: number | null;
  vegetables: string;
  condiments: string;
  groceries: string;
  comments: string;
  added: boolean;
}

export interface RouteOrderDraft {
  routeId: number;
  orderDate: string;
  driverName: string;
  vehicleName: string;
  notes: string;
  rows: RouteOrderDraftRow[];
}

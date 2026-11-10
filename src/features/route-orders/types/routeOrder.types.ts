import type { Route } from "@/core/api/types";
import type {
  RouteDetailClient,
  RouteDetailLocality,
} from "@/core/api/route/route.api";
import type { TripSummaryDTO } from "@/features/trips/types/trip.types";

export type RouteOrderUnitType = "EGG" | "LIVE_CHICKEN";

export interface RouteOrderLineDTO {
  id: number | null;
  clientId: number | null;
  clientName: string;
  businessName?: string | null;
  localityName?: string | null;
  isInternalBranch?: boolean | null;
  isInternalClient?: boolean | null;
  headCount?: number | null;
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
  driverId?: number | null;
  driverName?: string | null;
  vehicleId?: number | null;
  vehicleName?: string | null;
  tripId?: number | null;
  trip?: TripSummaryDTO | null;
  notes?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  salesRegenerationRequired?: boolean | null;
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
  headCount?: number;
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
  driverId?: number | null;
  driverName?: string | null;
  vehicleId?: number | null;
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
  isInternalBranch: boolean;
  isInternalClient: boolean;
  headCount: string;
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
  orderId: number | null;
  routeId: number;
  orderDate: string;
  driverId: number | null;
  driverName: string;
  vehicleId: number | null;
  vehicleName: string;
  tripId: number | null;
  notes: string;
  salesRegenerationRequired?: boolean;
  rows: RouteOrderDraftRow[];
}

export interface RouteOrderSaleCandidateDTO {
  orderId: number;
  lineId: number;
  unitType: "EGG" | "LIVE_CHICKEN";
  routeId: number;
  routeName: string;
  driverId: number | null;
  driverName: string | null;
  tripId: number | null;
  clientId: number;
  clientName: string;
  businessName?: string | null;
  localityName?: string | null;
  isInternalBranch?: boolean | null;
  isInternalClient?: boolean | null;
  headCount?: number | null;
  quantity?: number | null;
  unitPrice: number;
  weight?: number | null;
  kgSent?: number | null;
  alreadySold: boolean;
  salesRegenerationRequired?: boolean | null;
}

export interface GenerateRouteOrderSaleLineDTO {
  orderId: number;
  lineId: number;
  driverId?: number | null;
  force?: boolean;
  headCount?: number;
  quantity?: number;
  weight?: number;
  kgSent?: number;
  unitPrice?: number;
}

export interface GenerateRouteOrderSalesDTO {
  batchId: number;
  date: string;
  lines: GenerateRouteOrderSaleLineDTO[];
}

export interface GenerateRouteOrderSalesResultDTO {
  createdCount: number;
  updatedCount?: number;
  skippedCount: number;
  totalAmount: number;
  createdSaleIds: number[];
  skippedLineIds: number[];
  tripIds: number[];
  regenerationRequiredOrderIds?: number[];
}

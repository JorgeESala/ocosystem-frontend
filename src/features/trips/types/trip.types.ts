export type TripsUnitType = "LIVE_CHICKEN" | "EGG";

export interface BatchSourceInput {
  batchId: number;
  kgLoaded: number;
}

export interface BatchSourceDTO {
  id: number;
  batchId: number;
  batchLabel?: string | null;
  kgLoaded: number;
  createdAt: string;
}

export interface TripCreateRequestDTO {
  driverId: number;
  vehicleId?: number | null;
  routeId: number;
  departureDate: string;
  totalKgLoaded?: number | null;
  notes?: string | null;
  batchSources: BatchSourceInput[];
}

export interface TripUpdateRequestDTO {
  vehicleId?: number | null;
  totalKgLoaded?: number | null;
  notes?: string | null;
}

export interface TripResponseDTO {
  id: number;
  driverId: number;
  driverName?: string | null;
  vehicleId?: number | null;
  vehicleName?: string | null;
  routeId: number;
  routeName?: string | null;
  departureDate: string;
  totalKgLoaded?: number | null;
  totalKgReturned?: number | null;
  totalKgSold?: number | null;
  totalKgLoss?: number | null;
  notes?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  batchSources: BatchSourceDTO[];
  salesCount: number;
}

export interface TripSummaryDTO {
  id: number;
  driverId: number;
  driverName?: string | null;
  vehicleId?: number | null;
  vehicleName?: string | null;
  routeId: number;
  routeName?: string | null;
  departureDate: string;
  totalKgLoaded?: number | null;
  totalKgReturned?: number | null;
  batchSources: BatchSourceDTO[];
  salesCount: number;
}

export interface TripSaleDTO {
  id: number;
  batchId: number | null;
  batchLabel: string | null;
  clientId?: number | null;
  clientName?: string | null;
  employeeName?: string | null;
  routeName?: string | null;
  saleDate: string;
  weight?: number | null;
  kgSent?: number | null;
  saleTotal: number;
  officeReceived?: boolean | null;
}

export interface CedisBalance {
  creditorId: number;
  creditorName: string;
  balance: number;
  oldestDebtDate: string | null;
  openDebtCount: number;
}

export interface TripCollectionClient {
  clientId: number | null;
  clientName: string;
  phone: string | null;
  accountingEntityId: number | null;
  saleTotal: number;
  saldoTotal: number;
  oldestDebtDate: string | null;
  cedisBalances: CedisBalance[];
}

export interface TripCollection {
  tripId: number;
  departureDate: string;
  driverId: number;
  driverName: string | null;
  routeId: number;
  routeName: string | null;
  vehicleName: string | null;
  saleCount: number;
  totalSold: number;
  cashOnlyTotal: number;
  clients: TripCollectionClient[];
}

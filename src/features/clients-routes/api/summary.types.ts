export interface SummaryPeriod {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  dormantDays: number;
}

export interface PreviousSales {
  totalSales: number;
  profit: number;
  marginPct: number | null;
}

export interface SalesVariation {
  salesPct: number | null;
  profitPct: number | null;
  marginPoints: number | null;
}

export interface SummarySales {
  totalSales: number;
  totalQuantity: number;
  saleCount: number;
  cogs: number;
  fuelExpense: number;
  profit: number;
  marginPct: number | null;
  averageTicket: number | null;
  top10SharePct: number | null;
  previous: PreviousSales;
  variation: SalesVariation;
}

export interface ClientTypeCounts {
  branchesActive: number;
  branchesInactive: number;
  internalActive: number;
  internalInactive: number;
  externalActive: number;
  externalInactive: number;
}

export interface SummaryClients {
  active: number;
  inactive: number;
  withoutLocality: number;
  withoutRoute: number;
  neverPurchased: number;
  dormant: number;
  byType: ClientTypeCounts;
}

export interface SummaryRoutes {
  active: number;
  inactive: number;
  withoutLocalities: number;
  withoutActivity: number;
}

export interface TopClientSummary {
  clientId: number;
  name: string;
  businessName?: string | null;
  totalQuantity: number;
  totalSales: number;
  saleCount: number;
}

export interface TopRouteSummary {
  routeId: number;
  routeName: string;
  totalSales: number;
  profit: number;
  marginPct: number | null;
  previousTotalSales: number;
  salesPct: number | null;
  activeClients: number;
}

export interface ClientRoutesSummary {
  period: SummaryPeriod;
  sales: SummarySales;
  clients: SummaryClients;
  routes: SummaryRoutes;
  topClients: TopClientSummary[];
  topRoutes: TopRouteSummary[];
  routeIdsWithoutActivity: number[];
}

export interface RouteCalendarEntry {
  routeId: number;
  name: string;
  deliveryDays: number[];
  activeClients: number;
}

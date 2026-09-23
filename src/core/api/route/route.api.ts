import { http } from "@/shared/api/http";
import type { ComparisonMode, Route } from "../types";

const BASE_URL = "/api/v1/routes";
const PERFORMANCE_URL = "/api/v1/batches/sales-by-route";

export interface RoutePayload {
  name: string;
  localityIds?: number[];
  deliveryDays?: number[];
}

export interface RoutePerformance {
  routeId?: number | null;
  routeName?: string | null;
  totalQuantity: number;
  totalSales: number;
  cogs: number;
  fuelExpense: number;
  profit: number;
  marginPct?: number | null;
  previousTotalSales: number;
  previousProfit: number;
  salesPct?: number | null;
  profitPct?: number | null;
  saleCount: number;
}

export interface RouteDetailLocality {
  id: number;
  name: string;
}

export interface RouteDetailClient {
  id: number;
  name: string;
  businessName?: string | null;
  localityId?: number | null;
  localityName?: string | null;
  phone?: string | null;
  address?: string | null;
  isInternalBranch?: boolean;
  isInternalClient?: boolean;
  lastPurchaseDate?: string | null;
}

export interface RouteDetail {
  route: Route;
  localities: RouteDetailLocality[];
  clients: RouteDetailClient[];
}

export const getRoutes = async (includeInactive = false): Promise<Route[]> => {
  const { data } = await http.get<Route[]>(BASE_URL, {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
};

export const getRoute = async (id: number): Promise<Route> => {
  const { data } = await http.get<Route>(`${BASE_URL}/${id}`);
  return data;
};

export const getRouteDetail = async (id: number): Promise<RouteDetail> => {
  const { data } = await http.get<RouteDetail>(`${BASE_URL}/${id}/detail`);
  return data;
};

export const createRoute = async (payload: RoutePayload): Promise<Route> => {
  const { data } = await http.post<Route>(BASE_URL, payload);
  return data;
};

export const updateRoute = async (
  id: number,
  payload: RoutePayload,
): Promise<Route> => {
  const { data } = await http.put<Route>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteRoute = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};

export const reactivateRoute = async (id: number): Promise<Route> => {
  const { data } = await http.patch<Route>(`${BASE_URL}/${id}/reactivate`);
  return data;
};

export const getRoutePerformance = async (
  startDate: string,
  endDate: string,
  comparison: ComparisonMode,
): Promise<RoutePerformance[]> => {
  const { data } = await http.get<RoutePerformance[]>(PERFORMANCE_URL, {
    params: { startDate, endDate, comparison },
  });
  return data;
};

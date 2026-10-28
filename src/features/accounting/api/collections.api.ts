import { http } from "@/shared/api/http";
import type { TripCollection } from "../types/collection.types";

export interface RouteCollection {
  debtorEntityType: string;
  debtorEntityId: number;
  debtorDisplayName: string;
  accountingEntityId: number;
  saldoTotal: number;
  saldoRuta: number;
  phone: string | null;
  oldestDebtDateRuta: string | null;
}

export const fetchRouteCollections = async (
  routeId: number,
): Promise<RouteCollection[]> => {
  const params = new URLSearchParams({ routeId: String(routeId) });
  const { data } = await http.get<RouteCollection[]>(
    `/api/read/accounts-payable/collections/by-route?${params}`,
  );
  return data;
};

export const fetchTripCollections = async (
  from: string,
  to: string,
  routeId?: number | null,
): Promise<TripCollection[]> => {
  const params = new URLSearchParams({ from, to });
  if (routeId != null) {
    params.set("routeId", String(routeId));
  }
  const { data } = await http.get<TripCollection[]>(
    `/api/read/accounts-payable/collections/trips?${params.toString()}`,
  );
  return data;
};

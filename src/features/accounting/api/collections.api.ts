import { http } from "@/shared/api/http";

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

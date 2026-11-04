import { http } from "@/shared/api/http";
import type {
  RouteOrderDTO,
  RouteOrderSaveDTO,
  RouteOrderSheetDTO,
} from "../types/routeOrder.types";

const BASE_URL = "/api/v1/route-orders";

export const getRouteOrdersDay = async (
  date: string,
): Promise<RouteOrderSheetDTO[]> => {
  const { data } = await http.get<RouteOrderSheetDTO[]>(`${BASE_URL}/day`, {
    params: { date },
  });
  return data;
};

export const getRouteOrderSheet = async (
  routeId: number,
  date: string,
): Promise<RouteOrderSheetDTO> => {
  const { data } = await http.get<RouteOrderSheetDTO>(BASE_URL, {
    params: { routeId, date },
  });
  return data;
};

export const saveRouteOrder = async (
  payload: RouteOrderSaveDTO,
): Promise<RouteOrderDTO> => {
  const { data } = await http.put<RouteOrderDTO>(BASE_URL, payload);
  return data;
};

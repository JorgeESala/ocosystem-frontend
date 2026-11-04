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

export const createRouteOrderTrip = async (
  orderId: number,
): Promise<RouteOrderDTO> => {
  const { data } = await http.post<RouteOrderDTO>(
    `${BASE_URL}/${orderId}/trip`,
  );
  return data;
};

export const linkRouteOrderTrip = async (
  orderId: number,
  tripId: number,
): Promise<RouteOrderDTO> => {
  const { data } = await http.post<RouteOrderDTO>(
    `${BASE_URL}/${orderId}/link-trip`,
    { tripId },
  );
  return data;
};

export const unlinkRouteOrderTrip = async (
  orderId: number,
): Promise<RouteOrderDTO> => {
  const { data } = await http.delete<RouteOrderDTO>(
    `${BASE_URL}/${orderId}/trip`,
  );
  return data;
};

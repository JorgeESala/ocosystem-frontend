import { http } from "@/shared/api/http";
import type { ClientRoutesSummary, RouteCalendarEntry } from "./summary.types";

const BASE_URL = "/api/v1/clients-routes";

export const getSummary = async (
  startDate: string,
  endDate: string,
  dormantDays: number,
): Promise<ClientRoutesSummary> => {
  const { data } = await http.get<ClientRoutesSummary>(`${BASE_URL}/summary`, {
    params: { startDate, endDate, dormantDays },
  });
  return data;
};

export const getRouteCalendar = async (): Promise<RouteCalendarEntry[]> => {
  const { data } = await http.get<RouteCalendarEntry[]>(
    `${BASE_URL}/route-calendar`,
  );
  return data;
};

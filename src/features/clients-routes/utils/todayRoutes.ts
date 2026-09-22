import type { RouteCalendarEntry } from "../api/summary.types";

export interface TodayRoutes {
  routes: RouteCalendarEntry[];
  clientCount: number;
}

export const routesForToday = (
  entries: RouteCalendarEntry[],
  weekday: number,
): TodayRoutes => {
  const routes = entries.filter((entry) =>
    entry.deliveryDays.includes(weekday),
  );
  return {
    routes,
    clientCount: routes.reduce(
      (total, route) => total + route.activeClients,
      0,
    ),
  };
};

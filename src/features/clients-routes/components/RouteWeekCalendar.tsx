import { WEEKDAYS, todayWeekday } from "../config/unitConfig";
import type { RouteCalendarEntry } from "../api/summary.types";

interface RouteWeekCalendarProps {
  entries: RouteCalendarEntry[];
}

export const RouteWeekCalendar: React.FC<RouteWeekCalendarProps> = ({
  entries,
}) => {
  const today = todayWeekday();

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-gray-700"
      data-testid="route-calendar"
    >
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-slate-900/80 text-xs tracking-[0.18em] text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-3">Ruta</th>
            {WEEKDAYS.map((weekday) => (
              <th
                key={weekday.id}
                data-testid={
                  weekday.id === today
                    ? "today-header"
                    : `weekday-${weekday.id}`
                }
                className={`px-2 py-3 text-center ${
                  weekday.id === today ? "bg-blue-900/40 text-blue-200" : ""
                }`}
              >
                {weekday.short}
              </th>
            ))}
            <th className="px-4 py-3 text-right">Clientes</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={WEEKDAYS.length + 2}
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                No hay rutas activas.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.routeId} className="border-t border-gray-800">
                <td className="px-4 py-2 font-medium text-white">
                  {entry.name}
                </td>
                {WEEKDAYS.map((weekday) => (
                  <td key={weekday.id} className="px-2 py-2 text-center">
                    {entry.deliveryDays.includes(weekday.id) ? (
                      <span
                        data-testid="day-active"
                        className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"
                      />
                    ) : (
                      <span className="text-gray-700">·</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-2 text-right text-gray-300">
                  {entry.activeClients}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

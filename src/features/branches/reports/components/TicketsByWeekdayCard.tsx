import { Card } from "flowbite-react";
import { HiCalendar } from "react-icons/hi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekdayKey, WeekdayTicketsRow } from "../utils/ticketsByWeekday";

interface Props {
  rows: WeekdayTicketsRow[];
  peak: WeekdayTicketsRow | null;
  tickets: number;
}

const BASE_COLOR = "#3B82F6";
const PEAK_COLOR = "#60A5FA";
const PEAK_KEYS: WeekdayKey[] = ["L", "M", "X", "J", "V", "S", "D"];

const formatTickets = (value: number) =>
  `${Math.round(value).toLocaleString("es-MX")} tickets`;

export const TicketsByWeekdayCard = ({ rows, peak, tickets }: Props) => {
  const totalSamples = rows.reduce((acc, row) => acc + row.days, 0);

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-200">
        <HiCalendar className="text-blue-400" />
        Tickets por día de la semana
      </h3>
      <div className="rounded-lg border-l-4 border-blue-500 bg-gray-900/40 p-3">
        <div className="flex items-baseline gap-2">
          <h4 className="text-xl font-black text-blue-400">Total</h4>
          <span className="text-sm font-semibold text-white">
            · {formatTickets(tickets)}
          </span>
        </div>
      </div>

      {peak ? (
        <div className="mb-4 rounded-lg border-l-4 border-blue-500 bg-gray-900/40 p-3">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Día más fuerte
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-xl font-black text-blue-400">
              {peak.labelLong}
            </h4>
            <span className="text-sm font-semibold text-white">
              · {formatTickets(peak.avg)}
            </span>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-xs text-gray-500 italic">
          Sin datos suficientes en el rango seleccionado.
        </p>
      )}

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 10, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                Math.round(value).toLocaleString("es-MX")
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.12)" }}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              labelStyle={{
                color: "#F3F4F6",
                fontWeight: 600,
                marginBottom: 4,
              }}
              itemStyle={{
                color: "#F3F4F6",
                fontWeight: 500,
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as
                  | WeekdayTicketsRow
                  | undefined;
                return row?.labelLong ?? "";
              }}
              formatter={(value: number) => [formatTickets(value), "Promedio"]}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
              {rows.map((row, index) => (
                <Cell
                  key={`${row.key}-${index}`}
                  fill={
                    peak && PEAK_KEYS[index] === peak.key
                      ? PEAK_COLOR
                      : BASE_COLOR
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[10px] text-gray-500">
        Promedio calculado sobre {totalSamples}{" "}
        {totalSamples === 1 ? "día" : "días"} en el rango seleccionado.
      </p>
    </Card>
  );
};

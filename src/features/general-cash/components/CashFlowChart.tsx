import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CashFlowPointDTO } from "../types";
import FrequencyToggle from "./FrequencyToggle";
import type { CashFlowFrequency } from "../types";

interface Props {
  data: CashFlowPointDTO[];
  frequency: CashFlowFrequency;
  onFrequencyChange: (f: CashFlowFrequency) => void;
}

export default function CashFlowChart({
  data,
  frequency,
  onFrequencyChange,
}: Props) {
  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Flujo de Efectivo</h3>
        <FrequencyToggle value={frequency} onChange={onFrequencyChange} />
      </div>
      {data.length === 0 ? (
        <div className="flex h-[350px] items-center justify-center text-slate-500">
          Sin datos en el rango seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#E5E7EB" }}
              formatter={(value: number) => [
                `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
                undefined,
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#10B981"
              fill="#10B98180"
              name="Ingresos"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="#EF4444"
              fill="#EF444480"
              name="Gastos"
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#3B82F6"
              fill="#3B82F680"
              name="Saldo"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

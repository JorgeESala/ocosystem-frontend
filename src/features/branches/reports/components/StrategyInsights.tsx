import { formatMXN } from "@/utils/moneyNumbers";
import { Card } from "flowbite-react";
import { HiLightningBolt } from "react-icons/hi";
interface StrategyProps {
  attachRate: number;
  topAffinity: string;
  crossSellGap: number;
}

export const StrategyInsights = ({
  attachRate,
  topAffinity,
  crossSellGap,
}: StrategyProps) => {
  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-200">
        <HiLightningBolt className="text-yellow-400" />
        Estrategia de Venta
      </h3>

      <div className="flex flex-col gap-4">
        {/* Metric 1: Attach Rate */}
        <div className="rounded-lg border-l-4 border-blue-500 bg-gray-900/40 p-4">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Índice de Ticket Lleno
          </p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-white">
              {attachRate.toFixed(1)}%
            </h4>
            <span className="text-[10px] text-gray-600">Meta: 45%</span>
          </div>
          {/* Visual progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-700">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(attachRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Best Companion */}
        <div className="rounded-lg border-l-4 border-green-500 bg-gray-900/40 p-4">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            El Compadre del Pollo
          </p>
          <h4 className="mt-1 truncate text-lg font-bold text-green-400">
            {topAffinity}
          </h4>
          <p className="text-[10px] text-gray-600 italic">
            Producto más frecuente en combo
          </p>
        </div>

        {/* Metric 3: Revenue Gap */}
        <div className="rounded-lg border-l-4 border-red-500 bg-gray-900/40 p-4">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Dinero que se queda en la mesa
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-red-400">
              {formatMXN(crossSellGap)}
            </h4>
            <span className="text-[10px] text-gray-600">por ticket simple</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

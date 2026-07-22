import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HiArrowRight, HiCog } from "react-icons/hi";
import { useOrderPredictions } from "../api/orderPrediction.queries";
import type { OrderPredictionDTO, PredictionPeriodDTO } from "../types";

const DAY_NAMES: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mie",
  4: "Jue",
  5: "Vie",
  6: "Sab",
  7: "Dom",
};

function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export default function OrderPredictionWidget() {
  const { slug } = useParams();
  const predictionsQuery = useOrderPredictions();
  const predictions = predictionsQuery.data ?? [];

  return (
    <div className="h-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Prediccion de Pedidos - Semana Actual
        </h2>
        <Link
          to={`/business/${slug}/delivery-schedule`}
          className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white"
        >
          <HiCog className="h-4 w-4" />
        </Link>
      </div>

      {predictionsQuery.isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No hay calendarios de entrega configurados
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((pred) => (
            <PredictionCard key={pred.branchId} prediction={pred} />
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: OrderPredictionDTO }) {
  const chickenDays = (prediction.deliveryDays ?? [])
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(", ");

  const eggDays = (prediction.eggDeliveryDays ?? [])
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(", ");

  const hasChickenInterpolation =
    prediction.chickenPeriods?.some((p) => p.interpolated) ?? false;
  const hasEggInterpolation =
    prediction.eggPeriods?.some((p) => p.interpolated) ?? false;

  return (
    <div className="rounded-lg bg-slate-900/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {prediction.branchName}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Chicken */}
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Pollo</span>
            {chickenDays && (
              <span className="text-[10px] text-slate-500">
                ({chickenDays})
              </span>
            )}
          </div>
          {prediction.chickenPeriods?.map((period, i) => (
            <PeriodRow key={`ch-${i}`} period={period} color="text-slate-200" />
          ))}
          {hasChickenInterpolation && (
            <div className="mt-1 rounded bg-amber-900/30 px-2 py-1 text-[10px] text-amber-400">
              Datos interpolados
            </div>
          )}
        </div>

        {/* Eggs */}
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Huevo</span>
            {eggDays && (
              <span className="text-[10px] text-slate-500">({eggDays})</span>
            )}
          </div>
          {prediction.eggPeriods?.map((period, i) => (
            <PeriodRow
              key={`eg-${i}`}
              period={period}
              color="text-amber-400"
              isEgg
            />
          ))}
          {hasEggInterpolation && (
            <div className="mt-1 rounded bg-amber-900/30 px-2 py-1 text-[10px] text-amber-400">
              Datos interpolados
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 border-t border-slate-700/40 pt-2">
        <div className="flex justify-end gap-4 text-xs">
          <span className="font-semibold text-slate-300">
            Total: 🐔 {prediction.totalChicken} pollos
          </span>
          <span className="font-semibold text-amber-400">
            🥚 {prediction.totalEggs} casilleros
          </span>
        </div>
      </div>
    </div>
  );
}

function PeriodRow({
  period,
  color,
  isEgg,
}: {
  period: PredictionPeriodDTO;
  color: string;
  isEgg?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex cursor-help items-center justify-between rounded bg-slate-800/50 px-2 py-1">
        <div className="text-[11px] text-slate-400">
          {period.deliveryDay} {formatDate(period.deliveryDate)}
        </div>
        <div className={`text-xs font-semibold ${color}`}>
          {isEgg
            ? `🥚 ${period.eggs} casilleros`
            : `🐔 ${period.chicken} pollos`}
        </div>
      </div>

      {showTooltip && period.dailyBreakdown && (
        <div className="absolute top-full left-0 z-20 mt-1 w-72 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
          <div className="mb-2 text-[11px] font-semibold text-slate-300">
            Desglose por dia
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400">
                <th className="pb-1 text-left">Dia</th>
                <th className="pb-1 text-right">Promedio</th>
                <th className="pb-1 text-right">Anterior</th>
              </tr>
            </thead>
            <tbody>
              {period.dailyBreakdown.map((day) => (
                <tr
                  key={day.date}
                  className={
                    day.interpolated ? "text-amber-400" : "text-slate-300"
                  }
                >
                  <td className="py-0.5">
                    {day.dayName}
                    {day.interpolated && (
                      <span className="ml-1 text-[9px]">*</span>
                    )}
                  </td>
                  <td className="py-0.5 text-right font-medium">
                    {isEgg ? day.average : Math.round(day.average)}
                  </td>
                  <td className="py-0.5 text-right text-slate-500">
                    {isEgg ? day.previous : Math.round(day.previous)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-600 font-semibold text-slate-200">
                <td className="py-1">Total</td>
                <td className="py-1 text-right">
                  {isEgg ? period.eggs : period.chicken}
                </td>
                <td className="py-1 text-right text-slate-400">
                  {isEgg
                    ? period.dailyBreakdown.reduce((s, d) => s + d.previous, 0)
                    : Math.round(
                        period.dailyBreakdown.reduce(
                          (s, d) => s + d.previous,
                          0,
                        ),
                      )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-[9px] text-slate-500">
            Fuente: {isEgg ? "Reportes" : "Remesas"} (4 semanas)
            {period.interpolated && " * Datos interpolados"}
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import type { EfectivoPeriodo } from "../types/income-statement.types";

interface Props {
  efectivo: EfectivoPeriodo;
}

const Line: React.FC<{ label: string; amount: number; bold?: boolean }> = ({
  label,
  amount,
  bold,
}) => (
  <div
    className={`flex items-center justify-between px-3 py-1 ${
      bold
        ? "border-t border-gray-700 font-semibold text-white"
        : "text-gray-300"
    }`}
  >
    <span>{label}</span>
    <span className={`tabular-nums ${amount < 0 ? "text-rose-300" : ""}`}>
      {formatMXN(amount)}
    </span>
  </div>
);

export const CashPeriodSection: React.FC<Props> = ({ efectivo }) => {
  const netoColor = efectivo.neto >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          Efectivo del periodo
          <InfoTip title="¿De dónde sale este bloque?">
            <p>
              Se calcula con los movimientos de la Caja General del periodo
              seleccionado (ventas de contado, cobros, gastos y pagos). Es
              dinero real entrante y saliente, distinto de la utilidad del
              estado de resultados.
            </p>
          </InfoTip>
        </h2>
      </div>

      <div className="grid gap-4 p-3 md:grid-cols-2">
        <div className="space-y-0.5">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
            Entradas
          </p>
          <Line
            label="Ventas de contado"
            amount={efectivo.entradasVentasContado}
          />
          <Line label="Cobros a clientes" amount={efectivo.entradasCobros} />
          <Line label="Otros ingresos" amount={efectivo.entradasOtros} />
          <Line label="Total entradas" amount={efectivo.entradasTotal} bold />
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-rose-400 uppercase">
            Salidas
          </p>
          <Line label="Gastos" amount={efectivo.salidasGastos} />
          <Line
            label="Pagos a proveedores"
            amount={efectivo.salidasPagosProveedores}
          />
          <Line label="Otros egresos" amount={efectivo.salidasOtros} />
          <Line label="Total salidas" amount={efectivo.salidasTotal} bold />
        </div>
      </div>

      <div className="border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            Efectivo neto del periodo
          </span>
          <span className={`text-lg font-bold tabular-nums ${netoColor}`}>
            {formatMXN(efectivo.neto)}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import type { PuenteEfectivo } from "../types/income-statement.types";

interface Props {
  puente: PuenteEfectivo;
}

const Line: React.FC<{
  label: string;
  amount: number;
  bold?: boolean;
  info?: React.ReactNode;
}> = ({ label, amount, bold, info }) => (
  <div
    className={`flex items-center justify-between px-3 py-1 ${
      bold
        ? "border-t border-gray-700 font-semibold text-white"
        : "text-gray-300"
    }`}
  >
    <span className="flex items-center gap-1.5">
      {label}
      {info}
    </span>
    <span className="tabular-nums">{formatMXN(amount)}</span>
  </div>
);

export const CashBridgePanel: React.FC<Props> = ({ puente }) => {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          De utilidad a efectivo
          <InfoTip title="¿Qué relación hay entre ventas y efectivo?">
            <p>
              Las ventas de contado y los cobros de clientes son el dinero que
              realmente entró. Las ventas a crédito generan cartera pendiente:
              por eso el efectivo entrado no coincide con las ventas totales
              cuando hay créditos sin cobrar.
            </p>
            <p className="mt-1 font-mono text-[10px] text-blue-400">
              efectivo entrado = ventas - (ventas a crédito - cobros)
            </p>
          </InfoTip>
        </h2>
      </div>

      <div className="space-y-0.5 p-3">
        <Line label="Ventas de contado" amount={puente.ventasContado} />
        <Line label="Ventas a crédito" amount={puente.ventasCredito} />
        <Line label="Cobros del periodo" amount={puente.cobros} />
        <Line
          label="Efectivo entrado por ventas y cobros"
          amount={puente.efectivoEntrado}
          bold
        />
        <Line
          label="Variación de cartera (crédito - cobros)"
          amount={puente.variacionCartera}
          info={
            <InfoTip title="Variación de cartera">
              <p>
                Ventas a crédito del periodo menos cobros recibidos. Si es
                positiva, la cartera creció (se vendió a crédito de lo que se
                cobró); si es negativa, se cobró más de lo que se vendió a
                crédito en el periodo.
              </p>
            </InfoTip>
          }
        />

        {puente.cuadreDisponible && puente.cuadreDiferencia !== null && (
          <div
            className={`mt-1 rounded border px-3 py-1.5 text-xs ${
              Math.abs(Number(puente.cuadreDiferencia)) < 0.01
                ? "border-emerald-800 bg-emerald-900/40 text-emerald-300"
                : "border-amber-800 bg-amber-900/40 text-amber-300"
            }`}
          >
            <span className="flex items-center justify-between">
              <span>
                {Math.abs(Number(puente.cuadreDiferencia)) < 0.01
                  ? "Cuadre contra caja: sin diferencias"
                  : "Diferencia contra caja"}
              </span>
              <span className="font-semibold tabular-nums">
                {formatMXN(puente.cuadreDiferencia)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

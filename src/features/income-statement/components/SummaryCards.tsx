import React from "react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import type { IncomeStatement } from "../types/income-statement.types";

interface Props {
  data: IncomeStatement;
}

interface CardProps {
  label: string;
  value: string;
  valueClass: string;
  info?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ label, value, valueClass, info }) => (
  <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center">
    <p className="flex items-center justify-center gap-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
      {label}
      {info}
    </p>
    <p className={`mt-1 text-lg font-bold tabular-nums ${valueClass}`}>
      {value}
    </p>
  </div>
);

export const SummaryCards: React.FC<Props> = ({ data }) => {
  const netaClass =
    data.utilidadNeta >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        label="Ventas netas"
        value={formatMXN(data.ingresos.ventasNetas)}
        valueClass="text-green-300"
      />
      <Card
        label="Utilidad bruta"
        value={formatMXN(data.utilidadBruta)}
        valueClass="text-blue-300"
        info={
          <InfoTip title="Utilidad bruta">
            <p className="font-mono text-[10px] text-blue-400">
              ventasNetas - costoDeVentas
            </p>
          </InfoTip>
        }
      />
      <Card
        label="Gastos de operación"
        value={formatMXN(data.gastosOperacion.total)}
        valueClass="text-yellow-300"
      />
      <Card
        label="Utilidad neta"
        value={formatMXN(data.utilidadNeta)}
        valueClass={netaClass}
        info={
          <InfoTip title="Utilidad neta">
            <p className="font-mono text-[10px] text-blue-400">
              utilidadBruta - gastosDeOperación
            </p>
            <p className="mt-1">Utilidad del periodo antes de impuestos.</p>
          </InfoTip>
        }
      />
    </div>
  );
};

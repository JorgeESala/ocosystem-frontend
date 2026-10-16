import React from "react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import type {
  GastosSeccion,
  IncomeStatement,
} from "../types/income-statement.types";

interface RowProps {
  label: string;
  amount: number;
  bold?: boolean;
  indent?: boolean;
  info?: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ label, amount, bold, indent, info }) => (
  <div
    className={`flex items-center justify-between rounded px-3 py-1.5 ${
      bold ? "border-t border-gray-700 font-semibold" : ""
    } ${indent ? "pl-6" : ""}`}
  >
    <span
      className={`flex items-center gap-1.5 ${bold ? "text-white" : "text-gray-300"}`}
    >
      {label}
      {info}
    </span>
    <span
      className={`tabular-nums ${bold ? "text-white" : "text-gray-200"} ${
        amount < 0 ? "text-rose-300" : ""
      }`}
    >
      {formatMXN(amount)}
    </span>
  </div>
);

interface GastosSubsectionProps {
  title: string;
  seccion: GastosSeccion;
}

const GastosSubsection: React.FC<GastosSubsectionProps> = ({
  title,
  seccion,
}) => (
  <div className="space-y-0.5">
    <p className="px-3 pt-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
      {title}
    </p>
    {seccion.gastos.length === 0 ? (
      <p className="px-6 py-1 text-xs text-gray-500 italic">
        Sin gastos registrados en el periodo
      </p>
    ) : (
      seccion.gastos.map((gasto) => (
        <Row
          key={gasto.categoria}
          label={gasto.nombre}
          amount={gasto.monto}
          indent
        />
      ))
    )}
    <Row label={`Total ${title.toLowerCase()}`} amount={seccion.total} bold />
  </div>
);

interface Props {
  data: IncomeStatement;
}

export const StatementSection: React.FC<Props> = ({ data }) => {
  const utilidadColor =
    data.utilidadNeta >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">
          Estado de resultados
        </h2>
      </div>

      <div className="space-y-1 p-3">
        <p className="px-3 pt-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Ingresos
        </p>
        <Row
          label="Ventas de contado"
          amount={data.ingresos.ventasContado}
          indent
        />
        <Row
          label="Ventas a crédito"
          amount={data.ingresos.ventasCredito}
          indent
        />
        <Row
          label="Ventas netas"
          amount={data.ingresos.ventasNetas}
          bold
          info={
            <InfoTip title="Ventas netas del periodo">
              <p>
                Suma de las ventas de remesa con fecha dentro del rango
                seleccionado. Incluye ventas de contado y ventas a crédito
                (generan cuenta por cobrar).
              </p>
            </InfoTip>
          }
        />

        <p className="px-3 pt-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Costo de ventas
        </p>
        <Row
          label="Costo de remesas"
          amount={data.costoVentas.costoRemesas}
          indent
        />
        <Row label="Alimento" amount={data.costoVentas.alimento} indent />
        <Row label="Merma" amount={data.costoVentas.merma} indent />
        <Row
          label="Total costo de ventas"
          amount={data.costoVentas.total}
          bold
          info={
            <InfoTip title="¿Cómo se calcula?">
              <p className="font-mono text-[10px] text-blue-400">
                costoRemesas + alimento + merma
              </p>
              <p className="mt-1">
                Costo prorrateado de las remesas vendidas en el periodo, más los
                gastos de alimento (insumo de producción) y el costo de la
                merma.
              </p>
            </InfoTip>
          }
        />

        <Row
          label="UTILIDAD BRUTA"
          amount={data.utilidadBruta}
          bold
          info={
            <InfoTip title="¿Cómo se calcula?">
              <p className="font-mono text-[10px] text-blue-400">
                ventasNetas - costoDeVentas
              </p>
            </InfoTip>
          }
        />

        <p className="px-3 pt-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Gastos de operación
        </p>
        <GastosSubsection
          title="Gastos de venta"
          seccion={data.gastosOperacion.venta}
        />
        <GastosSubsection
          title="Gastos de administración"
          seccion={data.gastosOperacion.administracion}
        />
        <Row
          label="Total gastos de operación"
          amount={data.gastosOperacion.total}
          bold
          info={
            <InfoTip title="¿Cómo se calcula?">
              <p className="font-mono text-[10px] text-blue-400">
                gastosDeVenta + gastosDeAdministración
              </p>
              <p className="mt-1">
                Cada gasto se clasifica por su categoría: combustible y
                vehículos son gastos de venta; renta, servicios y nómina son
                gastos de administración. El alimento no aparece aquí porque ya
                está dentro del costo de ventas.
              </p>
            </InfoTip>
          }
        />

        <div className="mt-2 border-t-2 border-gray-600 pt-2">
          <Row
            label="UTILIDAD OPERATIVA"
            amount={data.utilidadOperativa}
            bold
          />
        </div>
        <div
          className={`rounded px-3 py-2 ${data.utilidadNeta >= 0 ? "bg-emerald-900/40" : "bg-rose-900/40"}`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-bold text-white">
              UTILIDAD NETA
              <InfoTip title="¿Cómo se calcula?">
                <p className="font-mono text-[10px] text-blue-400">
                  utilidadBruta - gastosDeOperación
                </p>
                <p className="mt-1">
                  Utilidad del periodo antes de impuestos. Se pinta verde si es
                  positiva y roja si es negativa.
                </p>
              </InfoTip>
            </span>
            <span className={`text-lg font-bold tabular-nums ${utilidadColor}`}>
              {formatMXN(data.utilidadNeta)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

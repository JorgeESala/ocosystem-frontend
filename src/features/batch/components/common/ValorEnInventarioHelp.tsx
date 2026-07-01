import React from "react";
import { Tooltip } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

export type ValorEnInventarioUnit = "pollos" | "aves" | "piezas";

const buildExplanation = (unit: ValorEnInventarioUnit): React.ReactNode => {
  const isEgg = unit === "piezas";
  const productName = isEgg ? "los huevos" : "las aves";
  const initialCap = unit.charAt(0).toUpperCase() + unit.slice(1);
  return (
    <div className="max-w-xs space-y-2 text-left text-gray-100">
      <p className="font-semibold text-white">
        ¿Qué es el valor en inventario?
      </p>
      <p className="text-xs leading-snug">
        Es el valor en dinero de {productName} que aún tienes disponibles en la
        remesa (sin vender y sin dar de baja).
      </p>
      <div className="border-t border-gray-600 pt-1.5">
        <p className="text-[10px] font-medium tracking-wider text-gray-300 uppercase">
          Fórmula
        </p>
        <p className="text-xs leading-snug text-emerald-200">
          ({unit} restantes ÷ {unit} iniciales) × costo total de la remesa
        </p>
      </div>
      <div className="border-t border-gray-600 pt-1.5">
        <p className="text-[10px] font-medium tracking-wider text-gray-300 uppercase">
          ¿De dónde sale cada dato?
        </p>
        <ul className="mt-0.5 space-y-0.5 text-xs leading-snug">
          <li>
            <strong className="text-white">Costo total</strong>: lo que pagaste
            por la remesa completa.
          </li>
          <li>
            <strong className="text-white">{initialCap} restantes</strong>:{" "}
            {productName} que aún no has vendido ni dado de baja.
          </li>
          <li>
            <strong className="text-white">{initialCap} iniciales</strong>:
            total de {productName} que llegaron en la remesa.
          </li>
        </ul>
      </div>

      <p className="text-[11px] leading-snug text-gray-400">
        Si el costo total es 0 o no hay {unit} iniciales, se muestra{" "}
        <strong className="text-white">—</strong>.
      </p>
    </div>
  );
};

interface ValorEnInventarioHelpProps {
  unit: ValorEnInventarioUnit;
  className?: string;
}

export const ValorEnInventarioHelp: React.FC<ValorEnInventarioHelpProps> = ({
  unit,
  className,
}) => (
  <Tooltip
    content={buildExplanation(unit)}
    placement="right"
    style="dark"
    arrow
  >
    <HiInformationCircle
      className={`cursor-help text-gray-400 hover:text-gray-200 ${className ?? ""}`}
      size={12}
      aria-label="¿Qué es el valor en inventario?"
      role="img"
    />
  </Tooltip>
);

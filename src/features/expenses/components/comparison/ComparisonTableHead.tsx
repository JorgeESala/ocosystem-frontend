import type { ReactNode } from "react";
import { InfoTip } from "@/components/InfoTip";

interface ComparisonTableHeadProps {
  firstColumnLabel?: string;
}

type HeaderAlign = "left" | "center" | "right";

interface HeaderCellProps {
  align?: HeaderAlign;
  helpTitle?: string;
  help?: ReactNode;
  children: ReactNode;
}

const HeaderCell = ({
  align = "left",
  helpTitle,
  help,
  children,
}: HeaderCellProps) => (
  <th
    className={`px-3 py-2.5 font-semibold ${
      align === "right" ? "text-right" : ""
    }`}
  >
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      {children}
      {help && helpTitle && (
        <InfoTip title={helpTitle} align={align}>
          {help}
        </InfoTip>
      )}
    </span>
  </th>
);

export default function ComparisonTableHead({
  firstColumnLabel = "Concepto",
}: ComparisonTableHeadProps) {
  return (
    <thead className="bg-slate-900/80 text-xs tracking-[0.12em] text-slate-400 uppercase">
      <tr>
        <HeaderCell>{firstColumnLabel}</HeaderCell>
        <HeaderCell align="right">Registros actual</HeaderCell>
        <HeaderCell align="right">Registros anterior</HeaderCell>
        <HeaderCell
          align="right"
          helpTitle="Diferencia de registros"
          help={
            <p>
              Registros actuales menos registros anteriores. Un número positivo
              significa más gastos.
            </p>
          }
        >
          Dif. registros
        </HeaderCell>
        <HeaderCell
          align="right"
          helpTitle="Variación de registros"
          help={
            <p>
              Cambio porcentual contra el periodo anterior. “Nuevo” significa
              que antes no había registros.
            </p>
          }
        >
          % registros
        </HeaderCell>
        <HeaderCell align="right">Monto actual</HeaderCell>
        <HeaderCell align="right">Monto anterior</HeaderCell>
        <HeaderCell
          align="right"
          helpTitle="Diferencia de monto"
          help={
            <p>
              Monto actual menos monto anterior. Un número positivo significa
              más gasto.
            </p>
          }
        >
          Dif. monto
        </HeaderCell>
        <HeaderCell
          align="right"
          helpTitle="Variación de monto"
          help={
            <p>
              Cambio porcentual contra el periodo anterior. “Nuevo” significa
              que antes no había monto.
            </p>
          }
        >
          % monto
        </HeaderCell>
      </tr>
    </thead>
  );
}

interface ComparisonTableHeadProps {
  firstColumnLabel?: string;
}

export default function ComparisonTableHead({
  firstColumnLabel = "Concepto",
}: ComparisonTableHeadProps) {
  return (
    <thead className="bg-slate-900/80 text-xs tracking-[0.12em] text-slate-400 uppercase">
      <tr>
        <th className="px-3 py-2.5 font-semibold">{firstColumnLabel}</th>
        <th className="px-3 py-2.5 text-right font-semibold">
          Registros actual
        </th>
        <th className="px-3 py-2.5 text-right font-semibold">
          Registros anterior
        </th>
        <th className="px-3 py-2.5 text-right font-semibold">Dif. registros</th>
        <th className="px-3 py-2.5 text-right font-semibold">% registros</th>
        <th className="px-3 py-2.5 text-right font-semibold">Monto actual</th>
        <th className="px-3 py-2.5 text-right font-semibold">Monto anterior</th>
        <th className="px-3 py-2.5 text-right font-semibold">Dif. monto</th>
        <th className="px-3 py-2.5 text-right font-semibold">% monto</th>
      </tr>
    </thead>
  );
}

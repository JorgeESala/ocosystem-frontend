import { useUnitCashCuts } from "@/features/general-cash/api/unitCash.queries";
import type { UnitCashUnit } from "@/features/general-cash/types.unit";
import {
  resolveEmployeeName,
  useEmployeeNames,
} from "@/features/general-cash/utils/employeeNames";

interface Props {
  unit: UnitCashUnit;
  startDate: Date;
  endDate: Date;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value + "T00:00:00").toLocaleDateString("es-MX");

export default function UnitCashCutList({ unit, startDate, endDate }: Props) {
  const cutsQuery = useUnitCashCuts(unit, startDate, endDate);
  const employeeNames = useEmployeeNames();

  const cuts = cutsQuery.data ?? [];

  if (cuts.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-slate-700 px-6 py-4">
      <h4 className="mb-2 text-sm font-semibold text-slate-400">
        Cortes de caja
      </h4>
      <div className="space-y-2">
        {cuts.map((cut) => (
          <div
            key={cut.id}
            className="rounded-lg border-l-4 border-amber-500 bg-slate-700/40 px-4 py-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {formatDate(cut.cutDate)}
              </span>
              <span className="text-sm text-slate-300">
                Cierre {formatCurrency(cut.closingBalance)} → Apertura{" "}
                {formatCurrency(cut.openingBalance)}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Entregó: {resolveEmployeeName(employeeNames, cut.handedOverBy)} ·
              Recibió: {resolveEmployeeName(employeeNames, cut.receivedBy)}
            </div>
            {cut.note && (
              <div className="mt-1 text-xs text-slate-500">{cut.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

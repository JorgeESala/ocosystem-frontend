import { useMemo, type ReactNode } from "react";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { formatMXN } from "@/utils/moneyNumbers";
import { InfoTip } from "./InfoTip";

interface Props {
  data: AccountsPayableResponse[];
  filterLabel: string | null;
  tooltips?: {
    total?: ReactNode;
    count?: ReactNode;
    antiquity?: ReactNode;
  };
}

const getAntiquityColor = (days: number) => {
  if (days <= 3) {
    return {
      text: "text-green-400",
      bg: "bg-green-500/5",
      border: "border-green-800/50",
    };
  }
  if (days <= 7) {
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/5",
      border: "border-yellow-800/50",
    };
  }
  if (days <= 14) {
    return {
      text: "text-orange-400",
      bg: "bg-orange-500/5",
      border: "border-gray-800",
    };
  }
  return {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-800",
  };
};

export const AccountingSummaryCards = ({
  data,
  filterLabel,
  tooltips,
}: Props) => {
  const totalDebt = useMemo(
    () => data.reduce((acc, curr) => acc + (curr.balance || 0), 0),
    [data],
  );

  const oldestDays = useMemo(() => {
    if (data.length === 0) return 0;
    const dates = data.map((d) => new Date(d.date).getTime());
    const oldest = Math.min(...dates);
    const diffTime = Math.abs(Date.now() - oldest);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [data]);

  const antiquityStyle = useMemo(
    () => getAntiquityColor(oldestDays),
    [oldestDays],
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="flex items-center gap-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
          Total Pendiente {filterLabel && `(${filterLabel})`}
          {tooltips?.total && (
            <InfoTip title="Total pendiente">{tooltips.total}</InfoTip>
          )}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {formatMXN(totalDebt)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
        <p className="flex items-center gap-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
          Documentos Abiertos
          {tooltips?.count && (
            <InfoTip title="Documentos abiertos">{tooltips.count}</InfoTip>
          )}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-400">
            {data.length}
          </span>
          <span className="text-sm text-nowrap text-gray-400">
            cuentas/remesas
          </span>
        </div>
      </div>

      <div
        className={`rounded-lg border p-5 shadow-sm transition-colors duration-300 ${antiquityStyle.border} ${antiquityStyle.bg}`}
      >
        <p
          className={`flex items-center gap-1 text-xs font-medium tracking-wider uppercase ${antiquityStyle.text}`}
        >
          Alerta de Antigüedad
          {tooltips?.antiquity && (
            <InfoTip title="Alerta de antigüedad">{tooltips.antiquity}</InfoTip>
          )}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{oldestDays}</span>
          <span className="text-sm text-gray-400">días activo</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500 italic">
          Basado en la cuenta más antigua.
        </p>
      </div>
    </div>
  );
};

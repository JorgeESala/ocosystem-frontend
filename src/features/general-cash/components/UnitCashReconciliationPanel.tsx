import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import {
  useApplyUnitCashReconciliation,
  useUnitCashReconciliationPreview,
} from "@/features/general-cash/api/unitCash.queries";
import type {
  UnitCashReconciliationChangeDTO,
  UnitCashReconciliationSummaryDTO,
  UnitCashUnit,
} from "@/features/general-cash/types.unit";

interface Props {
  unit: UnitCashUnit;
}

const CHANGE_LABELS: Record<string, string> = {
  CREATE: "Nuevo",
  UPDATE: "Ajuste",
  DELETE: "Eliminar",
};

const CHANGE_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400",
  UPDATE: "text-amber-400",
  DELETE: "text-red-400",
};

const SOURCE_LABELS: Record<string, string> = {
  SALE: "Venta",
  EXPENSE: "Gasto",
  PAYMENT: "Pago",
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value + "T00:00:00").toLocaleDateString("es-MX");

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UnitCashReconciliationPanel({ unit }: Props) {
  const previewQuery = useUnitCashReconciliationPreview(unit);
  const applyMutation = useApplyUnitCashReconciliation(unit);
  const [confirming, setConfirming] = useState(false);
  const [applied, setApplied] =
    useState<UnitCashReconciliationSummaryDTO | null>(null);

  const plan = previewQuery.data;
  const changes = plan?.changes ?? [];

  const handleApply = () => {
    applyMutation.mutate(undefined, {
      onSuccess: (summary) => {
        setApplied(summary);
        setConfirming(false);
      },
    });
  };

  if (previewQuery.isLoading || !plan) {
    return null;
  }

  if (changes.length === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-4 text-sm text-slate-400">
        <span className="font-medium text-emerald-400">
          Movimientos sincronizados.
        </span>
        {plan.lastReconciledAt && (
          <span>
            {" "}
            Última sincronización: {formatDateTime(plan.lastReconciledAt)}.
          </span>
        )}
        {applied && (
          <span>
            {" "}
            Última aplicación: {applied.created} nuevos, {applied.updated}{" "}
            ajustes, {applied.deleted} eliminados.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Sincronización pendiente ({changes.length})
        </h3>
        {plan.lastReconciledAt && (
          <span className="text-xs text-slate-500">
            Última sincronización: {formatDateTime(plan.lastReconciledAt)}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="pb-2 font-medium">Fecha</th>
              <th className="pb-2 font-medium">Documento</th>
              <th className="pb-2 font-medium">Concepto</th>
              <th className="pb-2 font-medium">Cambio</th>
              <th className="pb-2 text-right font-medium">Monto</th>
              <th className="pb-2 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <ChangeRow
                key={`${change.sourceType}-${change.sourceId}-${change.changeType}`}
                change={change}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-700 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-400">
          Saldo actual:{" "}
          <span className="font-medium text-white">
            {plan.previousBalance != null
              ? formatCurrency(plan.previousBalance)
              : "—"}
          </span>
          {" · "}
          Saldo proyectado:{" "}
          <span className="font-medium text-white">
            {plan.projectedBalance != null
              ? formatCurrency(plan.projectedBalance)
              : "—"}
          </span>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">
              ¿Aplicar {changes.length} cambios?
            </span>
            <Button
              size="sm"
              color="warning"
              onClick={handleApply}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Aplicando...
                </>
              ) : (
                "Si, aplicar"
              )}
            </Button>
            <Button
              size="sm"
              color="gray"
              onClick={() => setConfirming(false)}
              disabled={applyMutation.isPending}
            >
              No
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => setConfirming(true)}>
            Aplicar cambios
          </Button>
        )}
      </div>
    </div>
  );
}

function ChangeRow({ change }: { change: UnitCashReconciliationChangeDTO }) {
  const isPositive = change.balanceDelta >= 0;

  return (
    <tr className="border-b border-slate-800">
      <td className="py-2 text-slate-300">{formatDate(change.entryDate)}</td>
      <td className="py-2 text-slate-400">{change.folio ?? "—"}</td>
      <td className="py-2">
        <span className="text-slate-200">
          {SOURCE_LABELS[change.sourceType] ?? change.sourceType}
        </span>
        {change.description && (
          <span className="ml-1 text-slate-500">{change.description}</span>
        )}
      </td>
      <td
        className={`py-2 font-medium ${CHANGE_COLORS[change.changeType] ?? ""}`}
      >
        {CHANGE_LABELS[change.changeType] ?? change.changeType}
      </td>
      <td
        className={`py-2 text-right font-medium ${
          isPositive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(change.balanceDelta)}
        {change.changeType === "UPDATE" && change.previousAmount != null && (
          <div className="text-xs font-normal text-slate-500">
            antes {formatCurrency(change.previousAmount)}
          </div>
        )}
      </td>
      <td className="py-2 text-slate-400">{change.reason}</td>
    </tr>
  );
}

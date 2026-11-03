import { useState } from "react";
import { Button } from "flowbite-react";
import { HiArrowDown } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type { CollectionSuggestion } from "../types/eggCashFlow.types";

interface Props {
  collections: CollectionSuggestion[];
  onCollectPayment: (col: CollectionSuggestion) => void;
}

export default function PendingCollectionsPanel({
  collections,
  onCollectPayment,
}: Props) {
  const [showAllCollections, setShowAllCollections] = useState(false);
  const pendingCollections = collections.filter((c) => c.pending > 0);
  const visibleCollections = showAllCollections
    ? pendingCollections
    : pendingCollections.slice(0, 5);

  if (pendingCollections.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">
          Cobros por registrar
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay cobros a crédito pendientes de registrar en el flujo.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">
          Cobros por registrar
        </h3>
        <p className="text-sm text-slate-400">
          Cobros a crédito registrados en Contabilidad que aún no aparecen en el
          flujo de efectivo.
        </p>
      </div>

      <div className="space-y-2">
        {visibleCollections.map((c) => (
          <div
            key={c.paymentId}
            className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3"
          >
            <div>
              <div className="text-sm text-white">
                {formatDate(c.paymentDate)} — {c.payerName ?? "Sin nombre"}
              </div>
              <div className="text-xs text-slate-500">
                Monto: {formatMXN(c.amount)} · Ya registrado:{" "}
                {formatMXN(c.collected)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-emerald-400">
                +{formatMXN(c.pending)}
              </span>
              <Button size="xs" onClick={() => onCollectPayment(c)}>
                <HiArrowDown className="mr-1 h-3 w-3" />
                Registrar
              </Button>
            </div>
          </div>
        ))}
      </div>
      {pendingCollections.length > 5 && (
        <Button
          size="xs"
          color="light"
          className="mt-2"
          onClick={() => setShowAllCollections((value) => !value)}
        >
          {showAllCollections
            ? "Ver menos"
            : `Ver todos (${pendingCollections.length})`}
        </Button>
      )}
    </section>
  );
}

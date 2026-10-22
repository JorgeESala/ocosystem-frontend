import { Button } from "flowbite-react";
import { HiArrowDown, HiCash } from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatDate } from "../utils/cashFlow.utils";
import type {
  CollectionSuggestion,
  TripSuggestion,
} from "../types/eggCashFlow.types";

interface Props {
  trips: TripSuggestion[];
  collections: CollectionSuggestion[];
  onCollectTrip: (trip: TripSuggestion) => void;
  onCollectPayment: (col: CollectionSuggestion) => void;
  onRegisterAllPending?: (trips: TripSuggestion[]) => void;
}

export default function PendingCollectionsPanel({
  trips,
  collections,
  onCollectTrip,
  onCollectPayment,
  onRegisterAllPending,
}: Props) {
  const pendingTrips = trips.filter((t) => t.pending > 0);
  const pendingCollections = collections.filter((c) => c.pending > 0);

  if (pendingTrips.length === 0 && pendingCollections.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
        <h3 className="text-base font-semibold text-white">Por cobrar</h3>
        <p className="mt-1 text-sm text-slate-400">
          No hay despachos ni cobros pendientes de registrar.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Por cobrar</h3>
          <p className="text-sm text-slate-400">
            Despachos y cobros con dinero pendiente de ingresar a caja chica.
          </p>
        </div>
        {pendingTrips.length > 0 && onRegisterAllPending && (
          <Button
            size="xs"
            color="light"
            onClick={() => onRegisterAllPending(pendingTrips)}
          >
            Registrar todo ({pendingTrips.length})
          </Button>
        )}
      </div>

      {pendingTrips.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold tracking-[0.18em] text-amber-400 uppercase">
            Despachos
          </h4>
          <div className="space-y-2">
            {pendingTrips.map((t) => (
              <div
                key={t.tripId}
                className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3"
              >
                <div>
                  <div className="text-sm text-white">
                    {formatDate(t.departureDate)} —{" "}
                    {t.driverName ?? "Sin chofer"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Cobrable: {formatMXN(t.collectible)} · Ya registrado:{" "}
                    {formatMXN(t.collected)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm font-semibold ${
                      t.pending > 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {t.pending > 0 ? "+" : ""}
                    {formatMXN(t.pending)}
                  </span>
                  <Button size="xs" onClick={() => onCollectTrip(t)}>
                    <HiCash className="mr-1 h-3 w-3" />
                    Ingresar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingCollections.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-[0.18em] text-blue-400 uppercase">
            Cobros
          </h4>
          <div className="space-y-2">
            {pendingCollections.map((c) => (
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
                    Ingresar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

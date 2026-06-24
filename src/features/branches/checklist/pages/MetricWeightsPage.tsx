import { useEffect, useState } from "react";
import { Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiArrowLeft, HiCheck } from "react-icons/hi";
import { Alert } from "flowbite-react";
import { useMetricWeights, useUpdateMetricWeights } from "../api/metric-weights.queries";
import { metricRegistry } from "../config/metricRegistry";
import type { MetricWeights } from "../types/metric-weights.types";

export default function MetricWeightsPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useMetricWeights();
  const update = useUpdateMetricWeights();

  const [draft, setDraft] = useState<MetricWeights | null>(null);

  useEffect(() => {
    if (data && !draft) {
      setDraft(data);
    }
  }, [data, draft]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert color="failure">No se pudieron cargar las importancias de los indicadores.</Alert>
    );
  }

  if (!draft) {
    return null;
  }

  const handleWeightChange = (metricId: string, raw: string) => {
    const parsed = Number(raw);
    setDraft({
      weights: draft.weights.map((w) =>
        w.metricId === metricId ? { ...w, weight: Number.isFinite(parsed) ? parsed : 0 } : w,
      ),
    });
  };

  const handleSave = () => {
    update.mutate(draft, {
      onSuccess: (next) => setDraft(next),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Importancia de cada indicador</h1>
          <p className="text-sm text-slate-400">
            Ajusta cuánto pesa cada indicador en el puntaje general de las sucursales.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al checklist
          </Button>
        </Link>
      </header>

      <Card className="border-slate-700/80 bg-slate-950/70">
        <div className="space-y-4">
          {draft.weights.map((w) => {
            const meta = metricRegistry[w.metricId];
            const Icon = meta?.icon;
            return (
              <div
                key={w.metricId}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3"
              >
                {Icon && <Icon aria-hidden className="text-base text-slate-300" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {meta?.longLabel ?? w.metricId}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Importancia actual: {(w.weight * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="w-28">
                  <Label htmlFor={`weight-${w.metricId}`} className="sr-only">
                    Importancia
                  </Label>
                  <TextInput
                    id={`weight-${w.metricId}`}
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={w.weight}
                    onChange={(e) => handleWeightChange(w.metricId, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Los valores son decimales entre 0 y 1. El agregador usa el promedio
            ponderado para combinar los indicadores.
          </p>
          <Button
            color="blue"
            onClick={handleSave}
            disabled={update.isPending}
          >
            <HiCheck aria-hidden className="mr-2 h-4 w-4" />
            Guardar importancias
          </Button>
        </div>
        {update.isError && (
          <Alert color="failure" className="mt-3">
            No se pudieron guardar las importancias: {(update.error as Error)?.message ?? "error"}
          </Alert>
        )}
        {update.isSuccess && (
          <Alert color="success" className="mt-3">
            Pesos actualizados.
          </Alert>
        )}
      </Card>
    </div>
  );
}

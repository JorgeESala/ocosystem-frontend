import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Label,
  TextInput,
  Select,
  Alert,
  Spinner,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiCheck,
  HiSave,
  HiTrash,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { useBranches } from "@/features/branches/branch/branch.queries";
import {
  useMetricWeights,
  useUpdateMetricWeights,
} from "../api/metric-weights.queries";
import {
  useMetricFormulaConfig,
  useUpdateMetricFormulaConfig,
} from "../api/metric-formula-config.queries";
import {
  useExcludedBranches,
  useCreateExcludedBranch,
  useDeleteExcludedBranch,
} from "../api/excluded-branches.queries";
import { metricRegistry } from "../config/metricRegistry";
import { METRIC_HELP } from "../help/content";
import type { MetricWeights } from "../types/metric-weights.types";

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {open ? (
          <HiChevronDown className="h-5 w-5 text-slate-400" />
        ) : (
          <HiChevronRight className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {open && <div className="border-t border-slate-800 p-4">{children}</div>}
    </div>
  );
}

function WeightsSection() {
  const { data, isLoading, isError } = useMetricWeights();
  const update = useUpdateMetricWeights();
  const [draft, setDraft] = useState<MetricWeights | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  if (isLoading) return <Spinner size="sm" />;
  if (isError || !draft)
    return <Alert color="failure">Error al cargar pesos.</Alert>;

  const handleChange = (metricId: string, raw: string) => {
    const parsed = Number(raw);
    setDraft({
      weights: draft.weights.map((w) =>
        w.metricId === metricId
          ? { ...w, weight: Number.isFinite(parsed) ? parsed : 0 }
          : w,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Cada indicador tiene un peso que determina cuánto influye en el puntaje
        general. Los pesos deben sumar 1 (100%).
      </p>
      {draft.weights.map((w) => {
        const meta = metricRegistry[w.metricId];
        const Icon = meta?.icon;
        return (
          <div
            key={w.metricId}
            className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="text-base text-slate-300" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {meta?.longLabel ?? w.metricId}
                </p>
                <p className="text-[11px] text-slate-400">
                  Peso actual: {(w.weight * 100).toFixed(0)}%
                </p>
              </div>
              <div className="w-28">
                <Label className="sr-only">Peso</Label>
                <TextInput
                  type="number"
                  step="0.05"
                  min={0}
                  max={1}
                  value={w.weight}
                  onChange={(e) => handleChange(w.metricId, e.target.value)}
                />
              </div>
            </div>
            <p className="pl-8 text-[11px] text-slate-500">
              {w.metricId === "CHECKLIST" &&
                "Mide si se completaron las tareas diarias. Con peso 0.50, representa la mitad del puntaje."}
              {w.metricId === "SALES_GROWTH" &&
                "Compara ventas del período actual vs anterior. Con peso 0.30, representa el 30% del puntaje."}
              {w.metricId === "ACCOUNTS_PAYABLE" &&
                "Evalúa deuda y antigüedad vs las demás sucursales. Con peso 0.20, representa el 20% del puntaje."}
            </p>
          </div>
        );
      })}
      <div className="rounded-lg bg-slate-800/50 p-3 text-xs text-slate-300">
        <p className="mb-1 font-semibold text-slate-200">Ejemplo:</p>
        <p className="font-mono">
          Checklist: 80% × 0.50 = 40
          <br />
          Ventas: 60% × 0.30 = 18
          <br />
          Cuentas por pagar: 70% × 0.20 = 14
          <br />
          <span className="font-bold text-white">Puntaje total = 72%</span>
        </p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Los pesos deben sumar 1 (100%).
        </p>
        <Button
          color="blue"
          size="sm"
          onClick={() => update.mutate(draft)}
          disabled={update.isPending}
        >
          <HiCheck className="mr-1 h-4 w-4" /> Guardar
        </Button>
      </div>
      {update.isSuccess && <Alert color="success">Pesos actualizados.</Alert>}
      {update.isError && (
        <Alert color="failure">Error: {(update.error as Error)?.message}</Alert>
      )}
    </div>
  );
}

interface ParameterField {
  key: string;
  type: string;
  min: number;
  max: number;
  defaultValue: number;
  description: string;
}

function FormulasSection() {
  const { data: configs, isLoading, isError } = useMetricFormulaConfig();
  const updateMutation = useUpdateMetricFormulaConfig();
  const [formData, setFormData] = useState<
    Record<string, Record<string, number>>
  >({});

  useEffect(() => {
    if (configs) {
      const initial: Record<string, Record<string, number>> = {};
      configs.forEach((c) => {
        initial[c.metricId] = c.parameters;
      });
      setFormData(initial);
    }
  }, [configs]);

  if (isLoading) return <Spinner size="sm" />;
  if (isError) return <Alert color="failure">Error al cargar fórmulas.</Alert>;

  const handleChange = (metricId: string, key: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFormData((prev) => ({
        ...prev,
        [metricId]: { ...prev[metricId], [key]: num },
      }));
    }
  };

  const handleSave = (metricId: string) => {
    const params = formData[metricId];
    if (params) updateMutation.mutate({ metricId, parameters: params });
  };

  const handleReset = (metricId: string, schema: ParameterField[]) => {
    const defaults: Record<string, number> = {};
    schema.forEach((f) => {
      defaults[f.key] = f.defaultValue;
    });
    setFormData((prev) => ({ ...prev, [metricId]: defaults }));
  };

  return (
    <div className="space-y-4">
      {configs?.map((config) => {
        const help = METRIC_HELP[config.metricId];
        const schema = config.schema || [];
        if (schema.length === 0) return null;
        return (
          <div
            key={config.metricId}
            className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-white">
                {help?.title || config.metricId}
              </h3>
              <p className="text-xs text-slate-400">{help?.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {schema.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs">{field.description}</Label>
                  <TextInput
                    type="number"
                    step="0.01"
                    min={field.min}
                    max={field.max}
                    value={
                      formData[config.metricId]?.[field.key] ??
                      field.defaultValue
                    }
                    onChange={(e) =>
                      handleChange(config.metricId, field.key, e.target.value)
                    }
                  />
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {field.min} – {field.max} (default: {field.defaultValue})
                  </p>
                </div>
              ))}
            </div>
            {config.metricId === "SALES_GROWTH" && (
              <div className="space-y-1 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">
                  Cómo funciona esta fórmula:
                </p>
                <p>
                  El sistema compara las ventas del período actual con las del
                  período anterior. Calcula el crecimiento porcentual y lo
                  convierte en un puntaje de 0 a 100.
                </p>
                <p className="mt-2 font-mono text-[11px]">
                  Crecimiento = ((Ventas actuales – Ventas anteriores) / Ventas
                  anteriores) × 100
                  <br />
                  Puntaje = base + (crecimiento × multiplicador / 100)
                </p>
                <p className="mt-2 text-slate-400">
                  <strong>
                    Ejemplo con base={formData.SALES_GROWTH?.base ?? 50},
                    multiplicador={formData.SALES_GROWTH?.multiplier ?? 50}:
                  </strong>
                </p>
                <ul className="ml-4 space-y-0.5 font-mono text-[11px]">
                  <li>
                    • Ventas pasadas: $10,000 → Actuales: $12,000 → Crecimiento:
                    20%
                  </li>
                  <li>
                    • Puntaje = {formData.SALES_GROWTH?.base ?? 50} + (20 ×{" "}
                    {(formData.SALES_GROWTH?.multiplier ?? 50) / 100}) ={" "}
                    <strong>
                      {(formData.SALES_GROWTH?.base ?? 50) +
                        20 * ((formData.SALES_GROWTH?.multiplier ?? 50) / 100)}
                    </strong>
                  </li>
                  <li>
                    • Sin crecimiento (0%) → puntaje ={" "}
                    {formData.SALES_GROWTH?.base ?? 50}
                  </li>
                  <li>
                    • Crecimiento del 100% → puntaje ={" "}
                    {Math.min(
                      100,
                      (formData.SALES_GROWTH?.base ?? 50) +
                        100 * ((formData.SALES_GROWTH?.multiplier ?? 50) / 100),
                    )}
                  </li>
                </ul>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="xs"
                color="blue"
                onClick={() => handleSave(config.metricId)}
                disabled={updateMutation.isPending}
              >
                <HiSave className="mr-1 h-3 w-3" /> Guardar
              </Button>
              <Button
                size="xs"
                color="gray"
                onClick={() => handleReset(config.metricId, schema)}
              >
                Restablecer
              </Button>
            </div>
          </div>
        );
      })}
      {updateMutation.isSuccess && (
        <Alert color="success">Fórmula guardada.</Alert>
      )}
    </div>
  );
}

function ExcludedSection() {
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: excluded = [], isLoading: loadingExcluded } =
    useExcludedBranches();
  const createExclusion = useCreateExcludedBranch();
  const deleteExclusion = useDeleteExcludedBranch();
  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [reason, setReason] = useState("");

  const excludedIds = new Set(excluded.map((e) => e.branchId));
  const available = branches.filter((b) => !excludedIds.has(b.id));

  const handleAdd = () => {
    if (!selectedBranchId) return;
    createExclusion.mutate(
      { branchId: Number(selectedBranchId), reason: reason || undefined },
      {
        onSuccess: () => {
          setSelectedBranchId("");
          setReason("");
        },
      },
    );
  };

  if (loadingBranches || loadingExcluded) return <Spinner size="sm" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Label className="text-xs">Sucursal</Label>
          <Select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(Number(e.target.value) || "")}
          >
            <option value="">Seleccionar</option>
            {available.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[180px] flex-1">
          <Label className="text-xs">Razón (opcional)</Label>
          <TextInput
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: No es sucursal real"
          />
        </div>
        <Button
          size="sm"
          color="blue"
          onClick={handleAdd}
          disabled={!selectedBranchId || createExclusion.isPending}
        >
          Excluir
        </Button>
      </div>

      {createExclusion.isError && (
        <Alert color="failure">
          {(createExclusion.error as Error)?.message}
        </Alert>
      )}

      {excluded.length === 0 ? (
        <p className="text-sm text-slate-400">No hay sucursales excluidas.</p>
      ) : (
        <div className="space-y-2">
          {excluded.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
            >
              <div>
                <span className="font-medium text-white">{e.branchName}</span>
                {e.reason && (
                  <span className="ml-2 text-xs text-slate-400">
                    — {e.reason}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-rose-400 hover:text-rose-300"
                onClick={() => e.id != null && deleteExclusion.mutate(e.id)}
                disabled={deleteExclusion.isPending}
              >
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminConfigPage() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Configuración</h1>
          <p className="text-sm text-slate-400">
            Ajusta los parámetros del sistema de calificación.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft className="mr-2 h-4 w-4" /> Volver al desempeño
          </Button>
        </Link>
      </header>

      <Section title="Pesos de los indicadores" defaultOpen>
        <WeightsSection />
      </Section>

      <Section title="Fórmulas">
        <FormulasSection />
      </Section>

      <Section title="Sucursales excluidas">
        <ExcludedSection />
      </Section>

      <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Cómo afectan estos cambios?
        </h2>
        <p className="text-sm text-blue-300">
          Los cambios en pesos, fórmulas y exclusiones afectan inmediatamente el
          cálculo del puntaje de desempeño.
        </p>
      </div>
    </div>
  );
}

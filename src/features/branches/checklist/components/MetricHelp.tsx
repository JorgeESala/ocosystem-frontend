import { useMemo } from "react";
import { useMetricFormulaConfig } from "../api/metric-formula-config.queries";
import { METRIC_HELP } from "../help/content";

interface MetricHelpProps {
  metricId: string;
}

function getParam(
  params: Record<string, number> | undefined,
  key: string,
  fallback: number,
): number {
  return params?.[key] ?? fallback;
}

export default function MetricHelp({ metricId }: MetricHelpProps) {
  const help = METRIC_HELP[metricId];
  const { data: configs } = useMetricFormulaConfig();

  const dynamicExample = useMemo(() => {
    if (!help) return "";
    const config = configs?.find((c) => c.metricId === metricId);
    const params = config?.parameters;

    if (metricId === "SALES_GROWTH") {
      const base = getParam(params, "base", 50);
      const multiplier = getParam(params, "multiplier", 50);
      return `Semana pasada: $10,000\nEsta semana: $12,000\nCrecimiento: 20%\nPuntaje: ${base} + (20 × ${multiplier / 100}) = ${base + 20 * (multiplier / 100)}`;
    }
    if (metricId === "ACCOUNTS_PAYABLE") {
      const freshnessDays = getParam(params, "freshnessMaxAgeDays", 90);
      const freshness = Math.round((1 - 30 / freshnessDays) * 100);
      const score = Math.round((67 + freshness) / 2);
      return `Deuda: $5,000\nDeuda más antigua: 30 días\np75 del grupo: $15,000\nVolumen: 67% | Frescura: ${freshness}%\nPuntaje: ${score}%`;
    }
    return help.example;
  }, [metricId, configs, help]);

  if (!help) {
    return <p className="text-slate-400">Información no disponible</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">{help.title}</h3>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          {help.weight}
        </span>
      </div>
      <p className="text-sm text-slate-300">{help.description}</p>

      <div>
        <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-300 uppercase">
          Fórmula
        </h4>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-slate-800/50 p-2 text-xs text-slate-400">
          {help.formula}
        </pre>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-300 uppercase">
          Ejemplo
        </h4>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-slate-800/50 p-2 font-mono text-xs text-slate-400">
          {dynamicExample}
        </pre>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-300 uppercase">
          Cómo mejorar
        </h4>
        <ul className="space-y-1 text-sm text-slate-300">
          {help.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 text-emerald-400">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

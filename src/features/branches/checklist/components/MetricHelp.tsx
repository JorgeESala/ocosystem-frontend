import { METRIC_HELP } from '../help/content';

interface MetricHelpProps {
  metricId: string;
}

export default function MetricHelp({ metricId }: MetricHelpProps) {
  const help = METRIC_HELP[metricId];

  if (!help) {
    return <p className="text-slate-400">Información no disponible</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-200 mb-1">{help.title}</h3>
        <p className="text-slate-300 text-sm">{help.description}</p>
      </div>

      <div>
        <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-1">Fórmula</h4>
        <pre className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
          {help.formula}
        </pre>
      </div>

      <div>
        <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-1">Factores</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          {help.factors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-slate-500 mt-1">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-1">Consejos</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          {help.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

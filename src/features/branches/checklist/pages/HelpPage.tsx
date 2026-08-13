import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useMetricFormulaConfig } from "../api/metric-formula-config.queries";
import {
  GENERAL_HELP,
  METRIC_HELP,
  TASK_HELP,
  FAQ_HELP,
} from "../help/content";

const SCORE_COLORS: Record<string, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
};

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-slate-400">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={`h-full rounded-full ${color} flex items-center justify-center text-[10px] font-bold text-white`}
          style={{ width: value }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function getParam(
  params: Record<string, number> | undefined,
  key: string,
  fallback: number,
): number {
  return params?.[key] ?? fallback;
}

function useDynamicExamples() {
  const { data: configs } = useMetricFormulaConfig();

  return useMemo(() => {
    const salesConfig = configs?.find((c) => c.metricId === "SALES_GROWTH");
    const apConfig = configs?.find((c) => c.metricId === "ACCOUNTS_PAYABLE");

    const base = getParam(salesConfig?.parameters, "base", 50);
    const multiplier = getParam(salesConfig?.parameters, "multiplier", 50);
    const freshnessDays = getParam(
      apConfig?.parameters,
      "freshnessMaxAgeDays",
      90,
    );

    return {
      SALES_GROWTH: `Semana pasada: $10,000\nEsta semana: $12,000\nCrecimiento: 20%\nPuntaje: ${base} + (20 × ${multiplier / 100}) = ${base + 20 * (multiplier / 100)}`,
      ACCOUNTS_PAYABLE: `Deuda: $5,000\nDeuda más antigua: 30 días\np75 del grupo: $15,000\nVolumen: 67% | Frescura: ${Math.round((1 - 30 / freshnessDays) * 100)}%\nPuntaje: ${Math.round((67 + (1 - 30 / freshnessDays) * 100) / 2)}%`,
      CHECKLIST: `Lunes: 4 tareas evaluadas, 3 hechas = 75%\nMartes: 2 tareas evaluadas, 2 hechas = 100%\nPromedio del período = 87.5%`,
      _freshnessDays: freshnessDays,
    };
  }, [configs]);
}

export default function HelpPage() {
  const { slug } = useParams();
  const dynamicExamples = useDynamicExamples();

  const displayMetrics = useMemo(() => {
    return Object.values(METRIC_HELP).map((metric) => ({
      ...metric,
      example:
        dynamicExamples[metric.id as keyof typeof dynamicExamples] ||
        metric.example,
    }));
  }, [dynamicExamples]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona la calificación
          </h1>
          <p className="text-sm text-slate-400">
            Guía completa para entender los indicadores, las tareas y cómo
            mejorar tu puntaje.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al checklist
          </Button>
        </Link>
      </header>

      {/* QUE ES ESTO */}
      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          {GENERAL_HELP.sections[0].title}
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          {GENERAL_HELP.sections[0].content}
        </p>
      </div>

      {/* LOS 3 INDICADORES */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Los 3 indicadores</h2>
        {displayMetrics.map((metric) => (
          <div
            key={metric.id}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {metric.title}
              </h3>
              <span className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                {metric.weight} del puntaje
              </span>
            </div>
            <p className="text-sm text-slate-300">{metric.description}</p>

            <div className="rounded-lg bg-slate-800/50 p-3">
              <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Fórmula
              </h4>
              <pre className="text-xs whitespace-pre-wrap text-slate-300">
                {metric.formula}
              </pre>
            </div>

            <div className="rounded-lg bg-slate-800/50 p-3">
              <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Ejemplo
              </h4>
              <pre className="font-mono text-xs whitespace-pre-wrap text-slate-300">
                {metric.example}
              </pre>
            </div>

            <div>
              <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Qué influye
              </h4>
              <ul className="space-y-1 text-sm text-slate-300">
                {metric.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-slate-500">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                Cómo mejorar
              </h4>
              <ul className="space-y-1 text-sm text-slate-300">
                {metric.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* COMO SE CALCULA */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">
          Puntaje general
        </h2>
        <p className="mb-4 text-sm text-slate-300">
          {GENERAL_HELP.sections[3].content}
        </p>
        <div className="space-y-2">
          <ScoreBar
            label="Checklist (50%)"
            value="87.5%"
            color={SCORE_COLORS.good}
          />
          <ScoreBar
            label="Ventas (30%)"
            value="70%"
            color={SCORE_COLORS.warn}
          />
          <ScoreBar
            label="Ctas por pagar (20%)"
            value="67%"
            color={SCORE_COLORS.warn}
          />
        </div>
        <div className="mt-4 rounded-lg bg-slate-800/50 p-3 font-mono text-xs text-slate-300">
          Puntaje = (87.5 × 0.50) + (70 × 0.30) + (67 × 0.20) ={" "}
          <span className="font-bold text-white">78.15%</span>
        </div>
      </div>

      {/* COLORES */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">
          Qué significan los colores
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-300">
              <strong className="text-white">Buen desempeño</strong> — 80% a
              100%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-300">
              <strong className="text-white">Regular</strong> — 60% a 79%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-rose-500" />
            <span className="text-sm text-slate-300">
              <strong className="text-white">Necesita mejorar</strong> — 0% a
              59%
            </span>
          </div>
        </div>
      </div>

      {/* TAREAS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Tareas del checklist
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase"></th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Tarea
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Cuándo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Cómo hacerla
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(TASK_HELP).map((task, i) => (
                <tr
                  key={task.id}
                  className={
                    i < Object.values(TASK_HELP).length - 1
                      ? "border-b border-slate-800/60"
                      : ""
                  }
                >
                  <td className="px-4 py-3 text-lg">{task.icon}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{task.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {task.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{task.when}</td>
                  <td className="px-4 py-3 text-slate-300">{task.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RUTINAS */}
      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-emerald-200">
          {GENERAL_HELP.sections[2].title}
        </h2>
        <p className="text-sm leading-relaxed text-emerald-300">
          {GENERAL_HELP.sections[2].content}
        </p>
      </div>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Preguntas frecuentes
        </h2>
        {FAQ_HELP.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border-l-4 border-amber-500 bg-amber-950/30 p-4"
          >
            <h3 className="mb-1 text-sm font-semibold text-amber-200">
              {item.q}
            </h3>
            <p className="text-sm text-amber-300/80">{item.a}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Necesitas más ayuda?
        </h2>
        <p className="text-sm text-blue-300">
          Si tienes dudas sobre cómo mejorar tu puntaje o necesitas ayuda con
          alguna tarea, contacta a tu supervisor o administrador del sistema.
        </p>
      </div>
    </div>
  );
}

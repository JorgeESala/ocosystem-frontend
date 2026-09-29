import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import {
  PROFIT_FAQ,
  PROFIT_INTRO,
  PROFIT_METRICS,
} from "../help/content";

export default function BranchProfitHelpPage() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo leer Ganancias de sucursales
          </h1>
          <p className="text-sm text-slate-400">
            De dónde sale cada número: ventas de remesa, costo prorrateado,
            gastos, utilidad y efectivo esperado.
          </p>
        </div>
        <Link to={`/business/${slug}/profit`}>
          <Button color="light" size="sm">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver a ganancias
          </Button>
        </Link>
      </header>

      <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/40 p-5">
        <p className="text-sm leading-relaxed text-emerald-200">
          {PROFIT_INTRO}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Qué significa cada indicador
        </h2>
        {PROFIT_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-5"
          >
            <h3 className="text-lg font-semibold text-white">
              {metric.title}
            </h3>
            <p className="text-sm text-slate-300">{metric.description}</p>
            <ul className="space-y-1 text-sm text-slate-400">
              {metric.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2">
                  <span className="mt-0.5 text-slate-600">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Preguntas frecuentes
        </h2>
        {PROFIT_FAQ.map((item) => (
          <div
            key={item.q}
            className="rounded-xl border-l-4 border-amber-500 bg-amber-950/30 p-4"
          >
            <h3 className="mb-1 text-sm font-semibold text-amber-200">
              {item.q}
            </h3>
            <p className="text-sm text-amber-300/80">{item.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

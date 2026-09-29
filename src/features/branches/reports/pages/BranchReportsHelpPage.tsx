import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import {
  REPORTS_FAQ,
  REPORTS_INTRO,
  REPORTS_METRICS,
  REPORTS_SECTIONS,
} from "../help/content";

export default function BranchReportsHelpPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-3 border-b border-gray-800 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Cómo leer los reportes de sucursales
            </h1>
            <p className="text-sm text-gray-400">
              Guía para entender el consolidado, el ranking, el catálogo de
              productos y las comparaciones por periodo.
            </p>
          </div>
          <Link to={`/business/${slug}/reports`}>
            <Button color="gray" size="sm">
              <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
              Volver a reportes
            </Button>
          </Link>
        </header>

        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
          <p className="text-sm leading-relaxed text-blue-200">
            {REPORTS_INTRO}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Indicadores principales
          </h2>
          {REPORTS_METRICS.map((metric) => (
            <div
              key={metric.id}
              className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/60 p-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {metric.title}
              </h3>
              <p className="text-sm text-gray-300">{metric.description}</p>
              <ul className="space-y-1 text-sm text-gray-400">
                {metric.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-0.5 text-gray-600">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Cosas que conviene saber
          </h2>
          {REPORTS_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-gray-800 bg-gray-950/60 p-5"
            >
              <h3 className="mb-1 text-sm font-semibold text-blue-300">
                {section.title}
              </h3>
              <p className="text-sm text-gray-300">{section.content}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Preguntas frecuentes
          </h2>
          {REPORTS_FAQ.map((item) => (
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

        <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
          <h2 className="mb-2 text-lg font-semibold text-blue-200">
            ¿Necesitas más ayuda?
          </h2>
          <p className="text-sm text-blue-300">
            Si algo no cuadra, revisa primero la cobertura de reportes y las
            sucursales excluidas en Desempeño. Si la duda sigue, contacta a tu
            administrador.
          </p>
        </div>
      </div>
    </div>
  );
}

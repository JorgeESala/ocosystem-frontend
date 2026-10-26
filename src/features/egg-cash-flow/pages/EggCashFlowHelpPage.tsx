import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import {
  AUTOMATIC_ITEMS,
  BAGS,
  CASH_FLOW_INTRO,
  CUT_STEPS,
  EXCEL_COMPARISON,
  FAQ,
  FIRST_STEPS,
  FIX_ITEMS,
  GLOSSARY,
  LEDGER_DIFFERENCES,
  MANUAL_ITEMS,
  PAGE_SECTIONS,
  REMESA_NOTES,
} from "../help/content";

export default function EggCashFlowHelpPage() {
  const { slug } = useParams();
  const base = `/business/${slug}/cash-flow`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cómo funciona el Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Guía para tu primer corte: qué entra solo, qué capturas a mano y
            cómo se lee cada número.
          </p>
        </div>
        <Link to={base}>
          <Button color="light" size="sm">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al flujo
          </Button>
        </Link>
      </header>

      <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Qué es este módulo?
        </h2>
        <p className="text-sm leading-relaxed text-blue-300">
          {CASH_FLOW_INTRO}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Primeros pasos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FIRST_STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Las dos bolsas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BAGS.map((bag) => (
            <div
              key={bag.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <h3 className="text-lg font-semibold text-white">{bag.title}</h3>
              <p className="text-sm text-slate-400">{bag.description}</p>
              <div className="mt-3">
                <p className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">
                  Entra
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {bag.enters.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-500">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold tracking-wide text-red-300 uppercase">
                  Sale
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {bag.leaves.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-red-500">−</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-950/30 p-5">
          <h2 className="mb-2 text-lg font-semibold text-emerald-200">
            Qué se registra solo
          </h2>
          <ul className="space-y-2 text-sm text-emerald-300/90">
            {AUTOMATIC_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-emerald-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-950/30 p-5">
          <h2 className="mb-2 text-lg font-semibold text-amber-200">
            Qué se captura a mano
          </h2>
          <ul className="space-y-2 text-sm text-amber-200/90">
            {MANUAL_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Cómo leer la página
        </h2>
        {PAGE_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
          >
            <h3 className="text-lg font-semibold text-white">
              {section.title}
            </h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-1 text-sm text-slate-300">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5 text-slate-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Corte de semana paso a paso
        </h2>
        <div className="space-y-3">
          {CUT_STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <h3 className="text-sm font-semibold text-emerald-300">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Cómo corregir</h2>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-950/30 p-5">
          <ul className="space-y-2 text-sm text-amber-200/90">
            {FIX_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Remesas y deuda</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <ul className="space-y-2 text-sm text-slate-300">
            {REMESA_NOTES.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-slate-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          {EXCEL_COMPARISON.title}
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          {EXCEL_COMPARISON.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-slate-300">
              {paragraph}
            </p>
          ))}
          {EXCEL_COMPARISON.items && (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {EXCEL_COMPARISON.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-slate-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Por qué no coincide con la caja general o el Estado de resultados
        </h2>
        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
          <ul className="space-y-2 text-sm text-blue-200/90">
            {LEDGER_DIFFERENCES.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
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
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Glosario</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <p className="text-sm font-semibold text-white">{item.term}</p>
              <p className="mt-1 text-sm text-slate-300">{item.definition}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Necesitas más ayuda?
        </h2>
        <p className="text-sm text-blue-300">
          Si algo no cuadra, revisa primero el periodo, el corte y los
          movimientos. Si la duda sigue, contacta a tu administrador.
        </p>
      </div>
    </div>
  );
}

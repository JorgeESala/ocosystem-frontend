import { Link, useParams } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import { METRIC_HELP, TASK_HELP, GENERAL_HELP } from '../help/content';

export default function HelpPage() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cómo se mide el resultado</h1>
          <p className="text-sm text-slate-400">
            Guía completa para entender los indicadores, las tareas y cómo mejorar tu puntaje.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al checklist
          </Button>
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{GENERAL_HELP.title}</h2>
        <div className="space-y-4">
          {GENERAL_HELP.sections.map((section, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-semibold text-slate-200 mb-2">{section.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Indicadores</h2>
        <div className="space-y-4">
          {Object.values(METRIC_HELP).map((metric) => (
            <div key={metric.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
                <p className="text-sm text-slate-300">{metric.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-2">Fórmula</h4>
                <pre className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                  {metric.formula}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-2">Factores</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  {metric.factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-2">Consejos</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  {metric.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Tareas del Checklist</h2>
        <div className="space-y-4">
          {Object.values(TASK_HELP).map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-slate-300">{task.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Cuándo</span>
                  <p className="text-sm text-slate-300 mt-1">{task.when}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Quién</span>
                  <p className="text-sm text-slate-300 mt-1">{task.who}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Cómo</span>
                  <p className="text-sm text-slate-300 mt-1">{task.how}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="text-lg font-semibold text-blue-200 mb-2">¿Necesitas más ayuda?</h2>
        <p className="text-sm text-blue-300">
          Si tienes dudas sobre cómo mejorar tu puntaje o necesitas ayuda con alguna tarea,
          contacta a tu supervisor o administrador del sistema.
        </p>
      </section>
    </div>
  );
}

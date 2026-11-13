import { Alert, Spinner } from "flowbite-react";

export const ComparisonError = () => (
  <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
    No se pudo cargar la comparativa.
  </Alert>
);

export const ComparisonLoading = () => (
  <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
    <div className="flex items-center justify-center py-6">
      <Spinner size="lg" />
    </div>
  </section>
);

export const ComparisonEmpty = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    <div className="mt-4 rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
      No hay gastos para comparar en estos periodos.
    </div>
  </section>
);

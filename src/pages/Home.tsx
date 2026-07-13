import { Navigate, Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { BUSINESSES } from "@/business/business.config";
import { http } from "@/shared/api/http";
import { toIsoDateString } from "@/features/branches/checklist/utils/week";

function getTodayIso(): string {
  return toIsoDateString(new Date());
}

export default function Home() {
  const { user } = useAuth();

  const allowed = user?.allowedBusinesses ?? [];
  const allowedConfigs = BUSINESSES.filter((b) => allowed.includes(b.key));

  if (allowed.length === 1) {
    const slug = allowedConfigs[0]?.slug;
    const hasTasks = allowedConfigs[0]?.hasTasks;
    if (slug) {
      const dest = hasTasks
        ? `/business/${slug}/mis-tareas`
        : `/business/${slug}`;
      return <Navigate to={dest} replace />;
    }
  }

  return <MultiBuHome allowedConfigs={allowedConfigs} />;
}

function MultiBuHome({
  allowedConfigs,
}: {
  allowedConfigs: (typeof BUSINESSES)[number][];
}) {
  const today = getTodayIso();

  const taskBUs = allowedConfigs.filter((b) => b.hasTasks);

  const taskQueries = useQueries({
    queries: taskBUs.map((b) => ({
      queryKey: ["home-tasks", b.slug, today],
      queryFn: async () => {
        const { data } = await http.get("/api/v1/branches/checklist", {
          params: { date: today },
          headers: { "X-Business-Code": b.key.toLowerCase() },
        });
        return data.branches.reduce(
          (sum: number, br: { tasks: { status: string }[] }) =>
            sum + br.tasks.filter((t) => t.status === "EMPTY").length,
          0,
        );
      },
      staleTime: 1000 * 60 * 5,
    })),
  });

  const taskCountBySlug = new Map(
    taskBUs.map((b, i) => [b.slug, taskQueries[i]]),
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Unidades de negocio
      </h1>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allowedConfigs.map((b) => {
          const Icon = b.icon;
          const taskQuery = taskCountBySlug.get(b.slug);
          const pending = taskQuery?.data;
          const isLoading = taskQuery?.isLoading;

          return (
            <Link
              key={b.slug}
              to={b.hasTasks ? `/business/${b.slug}/mis-tareas` : `/business/${b.slug}`}
              className="flex flex-col items-center justify-center rounded-xl bg-gray-800 p-6 shadow-lg transition hover:bg-gray-700"
            >
              <Icon className="mb-3 text-4xl text-blue-400" />
              <h2 className="text-lg font-semibold">{b.name}</h2>
              {isLoading ? (
                <span className="mt-2 text-xs text-gray-500">Cargando...</span>
              ) : pending != null && pending > 0 ? (
                <span className="mt-2 rounded-full bg-amber-900/50 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                  {pending} pendiente{pending !== 1 ? "s" : ""}
                </span>
              ) : pending === 0 ? (
                <span className="mt-2 rounded-full bg-emerald-900/50 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Completado
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

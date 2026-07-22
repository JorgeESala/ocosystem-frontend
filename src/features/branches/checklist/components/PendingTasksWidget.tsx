import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiArrowRight, HiClipboardCheck } from "react-icons/hi";
import { checklistApi } from "../api/checklist.api";
import { checklistKeys } from "../api/checklist.keys";
import TaskActionCard from "./TaskActionCard";

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PendingTasksWidget() {
  const { slug } = useParams();
  const today = toLocalDateString(new Date());

  const { data, isLoading } = useQuery({
    queryKey: checklistKeys.daily(today, []),
    queryFn: () => checklistApi.getDaily({ date: today }),
  });

  const branches = data?.branches ?? [];
  const branchesWithPending = branches
    .filter((b) => b.tasks.some((t) => t.status === "EMPTY"))
    .sort((a, b) => {
      const aPending = a.tasks.filter((t) => t.status === "EMPTY").length;
      const bPending = b.tasks.filter((t) => t.status === "EMPTY").length;
      return bPending - aPending;
    });

  const totalPending = branchesWithPending.reduce(
    (sum, b) => sum + b.tasks.filter((t) => t.status === "EMPTY").length,
    0,
  );

  const allDone = branches.length > 0 && totalPending === 0;

  return (
    <div className="h-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiClipboardCheck className="h-5 w-5 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Tareas Pendientes
          </h2>
        </div>
        {totalPending > 0 && (
          <span className="rounded-full bg-blue-900/60 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
            {totalPending}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        </div>
      ) : allDone ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/40">
            <span className="text-emerald-400">✓</span>
          </div>
          <p className="text-sm text-slate-400">Todas las tareas completadas</p>
        </div>
      ) : branchesWithPending.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No hay tareas pendientes para hoy
        </div>
      ) : (
        <div className="space-y-3">
          {branchesWithPending.map((branch) => {
            const pending = branch.tasks.filter((t) => t.status === "EMPTY");
            return (
              <div key={branch.branchId}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    {branch.branchName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pending.map((task) => (
                    <TaskActionCard
                      key={task.taskId}
                      task={task}
                      slug={slug ?? "sucursales"}
                      branchId={branch.branchId}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 border-t border-slate-700/40 pt-3">
        <Link
          to={`/business/${slug}/mis-tareas`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 transition hover:gap-2"
        >
          Ver todas
          <HiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

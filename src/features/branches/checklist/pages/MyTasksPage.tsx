import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiChevronLeft, HiChevronRight, HiCalendar } from "react-icons/hi";
import { parseDateParam } from "@/utils/scopeParams";
import { checklistApi } from "../api/checklist.api";
import { checklistKeys } from "../api/checklist.keys";
import BranchTaskGroup from "../components/BranchTaskGroup";

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const parseBranchIds = (value: string | null): number[] =>
  (value ?? "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

export default function MyTasksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => parseDateParam(searchParams.get("date")) ?? new Date(),
  );
  const [branchFilter, setBranchFilter] = useState<number[] | null>(() => {
    const ids = [
      ...new Set([
        ...parseBranchIds(searchParams.get("branches")),
        ...parseBranchIds(searchParams.get("branch")),
      ]),
    ];
    return ids.length > 0 ? ids : null;
  });

  const dateStr = toLocalDateString(selectedDate);

  const { data, isLoading } = useQuery({
    queryKey: checklistKeys.daily(dateStr, []),
    queryFn: () => checklistApi.getDaily({ date: dateStr }),
  });

  const allBranches = data?.branches ?? [];
  const branches =
    branchFilter === null
      ? allBranches
      : allBranches.filter((branch) => branchFilter.includes(branch.branchId));
  const filteredBranchName =
    branchFilter === null
      ? null
      : branchFilter.length === 1
        ? (allBranches.find((branch) => branch.branchId === branchFilter[0])
            ?.branchName ?? `Sucursal ${branchFilter[0]}`)
        : `${branchFilter.length} sucursales`;
  const totalTasks = branches.reduce((sum, b) => sum + b.tasks.length, 0);
  const doneTasks = branches.reduce(
    (sum, b) => sum + b.tasks.filter((t) => t.status === "DONE").length,
    0,
  );
  const pendingTasks = branches.reduce(
    (sum, b) => sum + b.tasks.filter((t) => t.status === "EMPTY").length,
    0,
  );

  const navigateDay = (offset: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const isToday =
    toLocalDateString(selectedDate) === toLocalDateString(new Date());

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Mis tareas</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDay(-1)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isToday
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <HiCalendar className="h-4 w-4" />
            <span className="capitalize">{formatDate(selectedDate)}</span>
          </button>
          <button
            onClick={() => navigateDay(1)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <HiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!isLoading && totalTasks > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-slate-800/60 px-4 py-3 text-sm">
          <span className="text-slate-400">
            {branches.length}{" "}
            {branches.length === 1 ? "sucursal" : "sucursales"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{doneTasks} completadas</span>
          <span className="text-slate-600">|</span>
          <span
            className={pendingTasks > 0 ? "text-amber-400" : "text-slate-400"}
          >
            {pendingTasks} pendientes
          </span>
        </div>
      )}

      {!isLoading && branchFilter !== null && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/60 px-4 py-2.5 text-sm">
          <span className="text-slate-300">
            Mostrando solo:{" "}
            <span className="font-semibold text-white">
              {filteredBranchName}
            </span>
          </span>
          <button
            onClick={() => setBranchFilter(null)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            Mostrar todas
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-800/60"
            />
          ))}
        </div>
      )}

      {!isLoading && branches.length === 0 && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-8 text-center">
          <HiCalendar className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">
            No hay tareas registradas para esta fecha.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {branches.map((branch) => (
          <BranchTaskGroup
            key={branch.branchId}
            branch={branch}
            slug={slug ?? ""}
          />
        ))}
      </div>
    </div>
  );
}

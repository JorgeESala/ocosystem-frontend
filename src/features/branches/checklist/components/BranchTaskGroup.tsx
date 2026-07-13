import { HiUserCircle } from "react-icons/hi";
import type { BranchChecklist } from "../types/checklist.types";
import TaskActionCard from "./TaskActionCard";

interface BranchTaskGroupProps {
  branch: BranchChecklist;
  slug: string;
}

export default function BranchTaskGroup({ branch, slug }: BranchTaskGroupProps) {
  const pending = branch.tasks.filter((t) => t.status === "EMPTY");
  const done = branch.tasks.filter((t) => t.status === "DONE");
  const notApplicable = branch.tasks.filter((t) => t.status === "NOT_APPLICABLE");
  const allDone = pending.length === 0 && done.length > 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        allDone
          ? "border-emerald-700/40 bg-emerald-900/10"
          : "border-slate-700/60 bg-slate-800/40"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          {branch.branchName}
        </h3>
        {branch.personInCharge?.name && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <HiUserCircle className="h-3.5 w-3.5" />
            <span>{branch.personInCharge.name}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {pending.map((task) => (
          <TaskActionCard key={task.taskId} task={task} slug={slug} branchId={branch.branchId} />
        ))}
        {done.map((task) => (
          <TaskActionCard key={task.taskId} task={task} slug={slug} branchId={branch.branchId} />
        ))}
        {notApplicable.map((task) => (
          <TaskActionCard key={task.taskId} task={task} slug={slug} branchId={branch.branchId} />
        ))}
      </div>

      {allDone && (
        <p className="mt-2 text-xs text-emerald-400">Todas las tareas completadas</p>
      )}
    </div>
  );
}

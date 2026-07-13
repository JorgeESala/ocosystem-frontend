import { Link } from "react-router-dom";
import { FaCheck, FaTimes, FaClock, FaMinus } from "react-icons/fa";
import type { ChecklistTaskEntry } from "../types/checklist.types";
import { TASK_META } from "../config/checklist.config";

interface TaskActionCardProps {
  task: ChecklistTaskEntry;
  slug: string;
  branchId: number;
}

const ACCENT_PENDING: Record<string, string> = {
  blue: "bg-blue-900/40 text-blue-300 ring-blue-700/50 hover:bg-blue-800/50",
  rose: "bg-rose-900/40 text-rose-300 ring-rose-700/50 hover:bg-rose-800/50",
  amber: "bg-amber-900/40 text-amber-300 ring-amber-700/50 hover:bg-amber-800/50",
  purple: "bg-purple-900/40 text-purple-300 ring-purple-700/50 hover:bg-purple-800/50",
};

const ACCENT_DONE: Record<string, string> = {
  blue: "bg-slate-800/60 text-slate-500 ring-slate-700/40",
  rose: "bg-slate-800/60 text-slate-500 ring-slate-700/40",
  amber: "bg-slate-800/60 text-slate-500 ring-slate-700/40",
  purple: "bg-slate-800/60 text-slate-500 ring-slate-700/40",
};

export default function TaskActionCard({ task, slug, branchId }: TaskActionCardProps) {
  const meta = TASK_META[task.taskId];
  const isDone = task.status === "DONE";
  const isNotApplicable = task.status === "NOT_APPLICABLE";

  if (isNotApplicable) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 bg-slate-800/40 text-slate-600 ring-slate-700/30">
        <FaMinus className="h-3 w-3" />
        <span className="truncate">{meta.shortLabel}</span>
      </div>
    );
  }

  if (isDone) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${ACCENT_DONE[meta.accent]}`}
      >
        <FaCheck className="h-3 w-3" />
        <span className="truncate">{meta.shortLabel}</span>
      </div>
    );
  }

  const isLate = task.late;

  return (
    <Link
      to={`/business/${slug}/${meta.actionPath}?branch=${branchId}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors ${ACCENT_PENDING[meta.accent]}`}
    >
      {isLate ? (
        <FaClock className="h-3 w-3" />
      ) : (
        <FaTimes className="h-3 w-3" />
      )}
      <span className="truncate">{meta.shortLabel}</span>
    </Link>
  );
}

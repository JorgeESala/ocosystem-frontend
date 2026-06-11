import { Tooltip } from "flowbite-react";
import { FaCheck, FaExclamationTriangle, FaCircle } from "react-icons/fa";
import type { ChecklistTaskEntry } from "../types/checklist.types";
import { getUrgency } from "../utils/checklist-urgency";

interface ChecklistTaskRowProps {
  task: ChecklistTaskEntry;
  now: Date;
}

export default function ChecklistTaskRow({ task, now }: ChecklistTaskRowProps) {
  const urgency = getUrgency(task, now);

  let badgeClass = "";
  let icon: React.ReactNode = null;

  if (urgency.level === "done") {
    badgeClass =
      "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-700/40";
    icon = <FaCheck aria-hidden />;
  } else if (urgency.level === "light") {
    badgeClass = "bg-slate-800 text-slate-400 ring-1 ring-slate-700/60";
    icon = <FaCircle aria-hidden className="text-[0.55em]" />;
  } else if (urgency.level === "mid") {
    badgeClass = "bg-amber-900/30 text-amber-400 ring-1 ring-amber-700/40";
    icon = <FaExclamationTriangle aria-hidden />;
  } else {
    badgeClass = "bg-amber-900/50 text-amber-300 ring-1 ring-amber-500/50";
    icon = <FaExclamationTriangle aria-hidden />;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{task.label}</p>
        <Tooltip content={urgency.label} placement="left">
          <p className="truncate text-xs text-slate-400">{urgency.label}</p>
        </Tooltip>
      </div>
      <div
        role="status"
        aria-label={`${task.label}: ${urgency.label}`}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${badgeClass}`}
      >
        {icon}
      </div>
    </div>
  );
}

import { Tooltip } from "flowbite-react";
import { FaCheck, FaExclamationTriangle, FaCircle } from "react-icons/fa";
import type { ChecklistTaskEntry } from "../types/checklist.types";
import { getUrgency } from "../utils/checklist-urgency";

interface ChecklistStatusCellProps {
  task: ChecklistTaskEntry;
  now: Date;
  size?: "sm" | "md";
}

const SIZE_CLASSES: Record<"sm" | "md", string> = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
};

export default function ChecklistStatusCell({
  task,
  now,
  size = "md",
}: ChecklistStatusCellProps) {
  const urgency = getUrgency(task, now);
  const dimension = SIZE_CLASSES[size];

  let containerClass = "";
  let icon: React.ReactNode = null;

  if (urgency.level === "done") {
    containerClass =
      "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-700/40";
    icon = <FaCheck aria-hidden />;
  } else if (urgency.level === "light") {
    containerClass = "bg-slate-800 text-slate-400 ring-1 ring-slate-700/60";
    icon = <FaCircle aria-hidden className="text-[0.55em]" />;
  } else if (urgency.level === "mid") {
    containerClass =
      "bg-amber-900/30 text-amber-400 ring-1 ring-amber-700/40";
    icon = <FaExclamationTriangle aria-hidden />;
  } else {
    containerClass =
      "bg-amber-900/50 text-amber-300 ring-1 ring-amber-500/50";
    icon = <FaExclamationTriangle aria-hidden />;
  }

  return (
    <Tooltip content={urgency.label} placement="top">
      <div
        role="status"
        aria-label={`${task.label}: ${urgency.label}`}
        className={`mx-auto flex ${dimension} items-center justify-center rounded-xl ${containerClass}`}
      >
        {icon}
      </div>
    </Tooltip>
  );
}

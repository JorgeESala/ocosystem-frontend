import { HiCalendar, HiUserCircle } from "react-icons/hi";
import { FaCheck, FaTimes, FaClock, FaMinus } from "react-icons/fa";
import type { DailyChecklist, ChecklistTaskEntry } from "../types/checklist.types";
import { fromIsoDateString } from "../utils/week";

interface BranchDayRowProps {
  day: DailyChecklist;
}

export default function BranchDayRow({ day }: BranchDayRowProps) {
  const date = fromIsoDateString(day.date);
  const formattedDate = date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
      <div className="mb-2 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-slate-300">
          <HiCalendar className="h-3 w-3" />
          <span className="font-semibold">{formattedDate}</span>
        </div>
        {day.personInCharge && (
          <div className="flex items-center gap-1 text-slate-400">
            <HiUserCircle className="h-3 w-3" />
            <span>{day.personInCharge.name ?? "Sin encargado"}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {day.tasks.map((task) => (
          <TaskStatusPill key={task.taskId} task={task} />
        ))}
      </div>
    </div>
  );
}

interface TaskStatusPillProps {
  task: ChecklistTaskEntry;
}

function TaskStatusPill({ task }: TaskStatusPillProps) {
  const { status, label } = task;

  let icon;
  let bgColor;
  let textColor;
  let ringColor;

  if (status === "DONE") {
    icon = <FaCheck className="h-3 w-3" />;
    bgColor = "bg-emerald-900/30";
    textColor = "text-emerald-300";
    ringColor = "ring-emerald-700/40";
  } else if (status === "EMPTY") {
    if (task.late) {
      icon = <FaClock className="h-3 w-3" />;
      bgColor = "bg-amber-900/30";
      textColor = "text-amber-300";
      ringColor = "ring-amber-700/40";
    } else {
      icon = <FaTimes className="h-3 w-3" />;
      bgColor = "bg-rose-900/30";
      textColor = "text-rose-300";
      ringColor = "ring-rose-700/40";
    }
  } else {
    icon = <FaMinus className="h-3 w-3" />;
    bgColor = "bg-slate-800/60";
    textColor = "text-slate-400";
    ringColor = "ring-slate-700/60";
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ring-1 ${bgColor} ${textColor} ${ringColor}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

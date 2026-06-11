import { Tooltip } from "flowbite-react";
import type { BranchChecklist } from "../types/checklist.types";
import { TASK_ORDER } from "../config/checklist.config";
import ChecklistStatusCell from "./ChecklistStatusCell";

interface ChecklistBranchRowProps {
  branch: BranchChecklist;
  now: Date;
  totalPendingForBranch: number;
}

export default function ChecklistBranchRow({
  branch,
  now,
  totalPendingForBranch,
}: ChecklistBranchRowProps) {
  const tasksById = new Map(branch.tasks.map((t) => [t.taskId, t]));
  const ordered = TASK_ORDER.map((id) => tasksById.get(id)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );

  const pendingBadge =
    totalPendingForBranch > 0 ? (
      <Tooltip
        content={`${totalPendingForBranch} tarea${
          totalPendingForBranch === 1 ? "" : "s"
        } pendiente${totalPendingForBranch === 1 ? "" : "s"}`}
        placement="right"
      >
        <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
          {totalPendingForBranch}
        </span>
      </Tooltip>
    ) : null;

  return (
    <tr className="border-b border-slate-800/60 transition hover:bg-slate-900/40">
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {branch.branchName}
          </span>
          {pendingBadge}
        </div>
      </td>
      {ordered.map((task) => (
        <td key={task.taskId} className="px-3 py-3 align-middle">
          <ChecklistStatusCell task={task} now={now} />
        </td>
      ))}
    </tr>
  );
}

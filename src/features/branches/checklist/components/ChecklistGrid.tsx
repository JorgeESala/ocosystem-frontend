import { Tooltip } from "flowbite-react";
import type { IconType } from "react-icons";
import type { BranchChecklist } from "../types/checklist.types";
import { TASK_META, TASK_ORDER } from "../config/checklist.config";
import ChecklistBranchRow from "./ChecklistBranchRow";
import ChecklistTaskRow from "./ChecklistTaskRow";

interface ChecklistGridProps {
  branches: BranchChecklist[];
  now: Date;
}

const TASK_TOOLTIPS: Record<keyof typeof TASK_META, string> = {
  UPLOAD_SALES_REPORT: "Subir reporte de ventas",
  REGISTER_EXPENSES: "Registrar gastos del día",
  REGISTER_SALES_AND_ENTRIES: "Registrar entradas y ventas",
  REVIEW_ACCOUNTS_PAYABLE: "Revisar cuentas por pagar",
};

const TaskHeaderCell = ({
  taskId,
}: {
  taskId: keyof typeof TASK_META;
}) => {
  const meta = TASK_META[taskId];
  const Icon: IconType = meta.icon;
  return (
    <th className="px-3 py-3 text-center text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
      <Tooltip content={TASK_TOOLTIPS[taskId]} placement="top">
        <span className="inline-flex items-center gap-1.5">
          <Icon aria-hidden className="text-sm" />
          {meta.shortLabel}
        </span>
      </Tooltip>
    </th>
  );
};

export default function ChecklistGrid({ branches, now }: ChecklistGridProps) {
  if (branches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
        No hay sucursales para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60">
              <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Sucursal
              </th>
              {TASK_ORDER.map((taskId) => (
                <TaskHeaderCell key={taskId} taskId={taskId} />
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => {
              const pending = branch.tasks.filter(
                (t) => t.status === "PENDING",
              ).length;
              return (
                <ChecklistBranchRow
                  key={branch.branchId}
                  branch={branch}
                  now={now}
                  totalPendingForBranch={pending}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {branches.map((branch) => (
          <div
            key={branch.branchId}
            className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {branch.branchName}
                </span>
                {(() => {
                  const pending = branch.tasks.filter(
                    (t) => t.status === "PENDING",
                  ).length;
                  if (pending === 0) return null;
                  return (
                    <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
                      {pending} pendiente{pending === 1 ? "" : "s"}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div>
              {TASK_ORDER.map((taskId) => {
                const task = branch.tasks.find((t) => t.taskId === taskId);
                if (!task) return null;
                return (
                  <ChecklistTaskRow key={taskId} task={task} now={now} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

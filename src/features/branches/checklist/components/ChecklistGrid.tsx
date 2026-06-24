import type { BranchChecklist } from "../types/checklist.types";
import BranchPerformanceRow from "./BranchPerformanceRow";

interface ChecklistGridProps {
  branches: BranchChecklist[];
}

export default function ChecklistGrid({ branches }: ChecklistGridProps) {
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
              <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Desglose
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Puntaje
              </th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <BranchPerformanceRow key={branch.branchId} branch={branch} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {branches.map((branch) => (
          <div
            key={branch.branchId}
            className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4"
          >
            <BranchPerformanceRow branch={branch} />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import ComparisonConceptTable from "@/features/expenses/components/comparison/ComparisonConceptTable";
import type { BranchExpenseComparisonBranch } from "../types";

interface BranchExpenseConceptDrawerProps {
  open: boolean;
  onClose: () => void;
  branch: BranchExpenseComparisonBranch | null;
  currentLabel: string;
  previousLabel: string;
  businessUnitLabel: string;
}

export default function BranchExpenseConceptDrawer({
  open,
  onClose,
  branch,
  currentLabel,
  previousLabel,
  businessUnitLabel,
}: BranchExpenseConceptDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-full max-w-4xl bg-slate-900"
    >
      <DrawerHeader title={branch?.branchName ?? "Detalle de sucursal"} />
      <DrawerItems>
        {branch && (
          <div className="space-y-4 text-slate-100">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Comparativa de la sucursal
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {currentLabel} vs {previousLabel} · {businessUnitLabel}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Registros</p>
                  <p className="text-xl font-semibold text-white">
                    {branch.currentCount.toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {branch.previousCount.toLocaleString("es-MX")} en el periodo
                    anterior
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Monto</p>
                  <p className="text-xl font-semibold text-white">
                    {formatMXN(branch.currentAmount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatMXN(branch.previousAmount)} en el periodo anterior
                  </p>
                </div>
              </div>
            </div>

            <ComparisonConceptTable
              items={branch.byCategory}
              forceExpanded
              firstColumnLabel="Concepto"
              searchPlaceholder="Buscar concepto de la sucursal..."
            />
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
}

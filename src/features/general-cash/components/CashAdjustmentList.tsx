import { useState } from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { useCashAdjustments, useDeleteCashAdjustment } from "@/features/general-cash/api/generalCash.queries";
import type { CashAdjustmentDTO } from "@/features/general-cash/types";

interface Props {
  branchId: number;
  startDate: Date;
  endDate: Date;
  onEdit: (adjustment: CashAdjustmentDTO) => void;
}

export default function CashAdjustmentList({ branchId, startDate, endDate, onEdit }: Props) {
  const adjustmentsQuery = useCashAdjustments(branchId, startDate, endDate);
  const deleteMutation = useDeleteCashAdjustment();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const adjustments = adjustmentsQuery.data ?? [];

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, { onSuccess: () => setConfirmDelete(null) });
  };

  if (adjustments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-semibold text-slate-400">Ajustes</h4>
      <div className="space-y-2">
        {adjustments.map((adj) => {
          const isPositive = adj.amount >= 0;
          return (
            <div
              key={adj.id}
              className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-2"
            >
              <div className="flex-1">
                <div className="text-sm text-slate-300">{adj.reason}</div>
                <div className="text-xs text-slate-500">
                  {new Date(adj.date + "T00:00:00").toLocaleDateString("es-MX")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}${adj.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => onEdit(adj)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-600 hover:text-white"
                >
                  <HiPencil className="h-3 w-3" />
                </button>
                {confirmDelete === adj.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(adj.id)}
                      className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-500"
                    >
                      Si
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded bg-slate-600 px-2 py-0.5 text-xs text-white hover:bg-slate-500"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(adj.id)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-600 hover:text-red-400"
                  >
                    <HiTrash className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
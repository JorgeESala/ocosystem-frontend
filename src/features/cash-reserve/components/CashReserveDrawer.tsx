import { useState } from "react";
import { Button, Spinner, Datepicker } from "flowbite-react";
import { HiX, HiPlus } from "react-icons/hi";
import { useCashFlowHistory, useCreateCashAdjustment, useUpdateCashAdjustment } from "../api/cashReserve.queries";
import CashAdjustmentModal from "./CashAdjustmentModal";
import CashAdjustmentList from "./CashAdjustmentList";
import type { CashReserveResponseDTO, CashFlowHistoryDTO, CashAdjustmentDTO, CreateCashAdjustmentDTO, UpdateCashAdjustmentDTO } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  reserve: CashReserveResponseDTO | null;
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  INCOME_SALES: "Venta",
  INCOME_OTHER: "Ingreso",
  EXPENSE_OPERATIONAL: "Gasto",
  EXPENSE_BATCH: "Compra pollo",
  PAYMENT_OUT: "Pago",
  OTHER: "Ajuste",
};

const ENTRY_TYPE_COLORS: Record<string, string> = {
  INCOME_SALES: "text-emerald-400",
  INCOME_OTHER: "text-emerald-400",
  EXPENSE_OPERATIONAL: "text-red-400",
  EXPENSE_BATCH: "text-red-400",
  PAYMENT_OUT: "text-red-400",
  OTHER: "text-blue-400",
};

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CashReserveDrawer({ open, onClose, reserve }: Props) {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(formatDate(defaults.start));
  const [endDate, setEndDate] = useState(formatDate(defaults.end));
  const [appliedStart, setAppliedStart] = useState<Date>(defaults.start);
  const [appliedEnd, setAppliedEnd] = useState<Date>(defaults.end);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<CashAdjustmentDTO | null>(null);

  const historyQuery = useCashFlowHistory(
    reserve?.id ?? null,
    appliedStart,
    appliedEnd,
  );

  const createAdjustment = useCreateCashAdjustment();
  const updateAdjustment = useUpdateCashAdjustment();

  const history = historyQuery.data ?? [];
  const isLoading = historyQuery.isLoading;

  const handleApplyFilter = () => {
    setAppliedStart(new Date(startDate + "T00:00:00"));
    setAppliedEnd(new Date(endDate + "T23:59:59"));
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setAppliedStart(start);
    setAppliedEnd(end);
  };

  const handleNewAdjustment = () => {
    setEditingAdjustment(null);
    setShowAdjustmentModal(true);
  };

  const handleEditAdjustment = (adj: CashAdjustmentDTO) => {
    setEditingAdjustment(adj);
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = (payload: CreateCashAdjustmentDTO | { id: number; payload: UpdateCashAdjustmentDTO }) => {
    if ("id" in payload) {
      updateAdjustment.mutate(payload, { onSuccess: () => setShowAdjustmentModal(false) });
    } else {
      createAdjustment.mutate(payload, { onSuccess: () => setShowAdjustmentModal(false) });
    }
  };

  if (!open || !reserve) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {reserve.branchName}
            </h2>
            <p className="text-sm text-slate-400">Historial de movimientos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleNewAdjustment}>
              <HiPlus className="mr-1 h-3 w-3" />
              Ajuste
            </Button>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Balance summary */}
        <div className="border-b border-slate-700 px-6 py-4">
          <div className="text-sm text-slate-400">Saldo actual</div>
          <div className="text-2xl font-bold text-white">
            ${reserve.currentBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Date filter */}
        <div className="border-b border-slate-700 px-6 py-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-slate-400">Periodo:</span>
            <button
              onClick={() => handlePreset(7)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
            >
              7 dias
            </button>
            <button
              onClick={() => handlePreset(15)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
            >
              15 dias
            </button>
            <button
              onClick={() => handlePreset(30)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
            >
              30 dias
            </button>
            <button
              onClick={() => handlePreset(90)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
            >
              90 dias
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Datepicker
              language="es-MX"
              value={new Date(startDate + "T00:00:00")}
              onChange={(d) => d && setStartDate(formatDate(d))}
            />
            <span className="text-slate-500">a</span>
            <Datepicker
              language="es-MX"
              value={new Date(endDate + "T00:00:00")}
              onChange={(d) => d && setEndDate(formatDate(d))}
            />
            <button
              onClick={handleApplyFilter}
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-500"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Adjustments list */}
        <CashAdjustmentList
          branchId={reserve.branchId}
          startDate={appliedStart}
          endDate={appliedEnd}
          onEdit={handleEditAdjustment}
        />

        {/* History table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No hay movimientos en este periodo
            </div>
          ) : (
            <>
              <h4 className="mb-2 text-sm font-semibold text-slate-400">Historial</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Descripcion</th>
                    <th className="pb-2 text-right font-medium">Monto</th>
                    <th className="pb-2 text-right font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Adjustment modal */}
      {reserve && (
        <CashAdjustmentModal
          open={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          branchId={reserve.branchId}
          branchName={reserve.branchName}
          adjustment={editingAdjustment}
          onSave={handleSaveAdjustment}
          isSaving={createAdjustment.isPending || updateAdjustment.isPending}
        />
      )}
    </>
  );
}

function HistoryRow({ entry }: { entry: CashFlowHistoryDTO }) {
  const isPositive = entry.amount >= 0;
  const colorClass = ENTRY_TYPE_COLORS[entry.entryType] ?? "text-slate-400";
  const label = ENTRY_TYPE_LABELS[entry.entryType] ?? entry.entryType;

  return (
    <tr className="border-b border-slate-800">
      <td className="py-2 text-slate-300">
        {formatDateTime(entry.createdAt)}
      </td>
      <td className="py-2">
        <span className={`font-medium ${colorClass}`}>{label}</span>
      </td>
      <td className="max-w-[200px] truncate py-2 text-slate-400">
        {entry.description ?? "\u2014"}
      </td>
      <td className={`py-2 text-right font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
        {isPositive ? "+" : ""}${entry.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </td>
      <td className="py-2 text-right font-medium text-white">
        ${entry.runningBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

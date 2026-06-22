import React, { useMemo, useState } from "react";
import { Spinner, Alert } from "flowbite-react";
import { HiArrowUp, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { GiFeather } from "react-icons/gi";
import type { Batch, Branch, BranchesBatchSale } from "@/services/api";
import { useMarkCuentasReceived } from "./api/sales.queries";
import { getCuentaKey, type PendingCuenta } from "./utils/cuenta";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";

type TabKey = "pending" | "available";

interface BranchGlobalSummaryProps {
  batches: Batch[];
  branches: Branch[];
  bulkSales: BranchesBatchSale[];
  isBulkSalesLoading: boolean;
  isBulkSalesError: boolean;
  onBatchClick?: (batchId: number) => void;
  onSelectSale?: (batchId: number) => void;
}

const resolveBranchName = (branches: Branch[], branchId: number | null) =>
  branches.find((b) => b.id === branchId)?.name ??
  (branchId != null ? `Sucursal #${branchId}` : "Sin sucursal");

export const BranchGlobalSummary: React.FC<BranchGlobalSummaryProps> = ({
  batches,
  branches,
  bulkSales,
  isBulkSalesLoading,
  isBulkSalesError,
  onBatchClick,
  onSelectSale,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const salesByBatch = useMemo(() => {
    const grouped = new Map<number, BranchesBatchSale[]>();
    for (const sale of bulkSales) {
      if (sale.batchId == null) continue;
      const list = grouped.get(sale.batchId) ?? [];
      list.push(sale);
      grouped.set(sale.batchId, list);
    }
    return batches.map((batch) => ({
      batch,
      sales: grouped.get(batch.id) ?? [],
    }));
  }, [batches, bulkSales]);

  const pendingCuentas = useMemo<PendingCuenta[]>(() => {
    const groups = new Map<string, PendingCuenta>();
    for (const { batch, sales } of salesByBatch) {
      for (const sale of sales) {
        if (sale.officeReceived) continue;
        const key = getCuentaKey(sale, batch);
        const branchId = batch.branchId ?? sale.branchId ?? null;
        const existing = groups.get(key);
        if (existing) {
          existing.sales.push({ sale, batchId: batch.id });
          continue;
        }
        groups.set(key, {
          key,
          clientId: sale.clientId,
          clientName:
            sale.clientName || sale.employeeName || "Sin responsable",
          branchId,
          date: sale.date,
          sales: [{ sale, batchId: batch.id }],
        });
      }
    }
    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(`${a.date}T00:00:00`).getTime() -
        new Date(`${b.date}T00:00:00`).getTime(),
    );
  }, [salesByBatch]);

  const pendingSalesCount = useMemo(
    () => pendingCuentas.reduce((sum, c) => sum + c.sales.length, 0),
    [pendingCuentas],
  );

  const pendingAmount = useMemo(
    () =>
      pendingCuentas.reduce(
        (sum, c) => sum + c.sales.reduce((s, x) => s + x.sale.saleTotal, 0),
        0,
      ),
    [pendingCuentas],
  );

  const availableRows = useMemo(() => {
    return salesByBatch
      .map(({ batch, sales }) => {
        const chickensSold = sales.reduce((sum, s) => sum + s.quantitySold, 0);
        const remaining = batch.chickenQuantity - chickensSold;
        return { batch, remaining };
      })
      .filter((row) => row.remaining > 0)
      .sort(
        (a, b) =>
          new Date(`${a.batch.date}T00:00:00`).getTime() -
          new Date(`${b.batch.date}T00:00:00`).getTime(),
      );
  }, [salesByBatch]);

  const totalAvailableChickens = useMemo(
    () => availableRows.reduce((sum, r) => sum + r.remaining, 0),
    [availableRows],
  );

  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Resumen</h3>
        {isBulkSalesLoading && <Spinner size="sm" />}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Cuentas pendientes
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "available"
              ? "bg-blue-600 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Pollos disponibles
        </button>
      </div>

      {isBulkSalesError && (
        <Alert color="failure" className="mb-3">
          No se pudieron cargar las ventas de las remesas.
        </Alert>
      )}

      {activeTab === "pending" && (
        <PendingTab
          cuentas={pendingCuentas}
          branches={branches}
          count={pendingCuentas.length}
          amount={pendingAmount}
          isLoading={isBulkSalesLoading}
          totalSalesLoaded={pendingSalesCount}
          onSelectSale={onSelectSale}
        />
      )}

      {activeTab === "available" && (
        <AvailableTab
          rows={availableRows}
          branches={branches}
          totalChickens={totalAvailableChickens}
          onBatchClick={onBatchClick}
        />
      )}
    </div>
  );
};

interface BranchSummary {
  branchId: number;
  branchName: string;
  count: number;
  amount: number;
}

interface PendingTabProps {
  cuentas: PendingCuenta[];
  branches: Branch[];
  count: number;
  amount: number;
  isLoading: boolean;
  totalSalesLoaded: number;
  onSelectSale?: (batchId: number) => void;
}

const PendingTab: React.FC<PendingTabProps> = ({
  cuentas,
  branches,
  count,
  amount,
  isLoading,
  totalSalesLoaded,
  onSelectSale,
}) => {
  const branchSummaries = useMemo<BranchSummary[]>(() => {
    const map = new Map<number, BranchSummary>();
    for (const cuenta of cuentas) {
      const branchId = cuenta.branchId ?? -1;
      const entry = map.get(branchId) ?? {
        branchId,
        branchName: resolveBranchName(branches, branchId),
        count: 0,
        amount: 0,
      };
      entry.count += 1;
      entry.amount += cuenta.sales.reduce(
        (sum, s) => sum + s.sale.saleTotal,
        0,
      );
      map.set(branchId, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [cuentas, branches]);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-red-900/40 bg-red-950/20 p-3">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-wider text-red-300 uppercase">
              Cuentas sin recibir
            </p>
            <p className="text-2xl font-bold text-white">
              {count.toLocaleString("es-MX")}
            </p>
            <p className="text-[11px] text-gray-400">cuentas pendientes</p>
          </div>
          <div className="border-l border-gray-700 pl-4">
            <p className="text-[10px] font-medium tracking-wider text-red-300 uppercase">
              Monto pendiente
            </p>
            <p className="text-2xl font-bold text-white">{formatMXN(amount)}</p>
            <p className="text-[11px] text-gray-400">por cobrar en oficina</p>
          </div>
        </div>

        {branchSummaries.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-red-900/30 pt-2">
            <span className="text-[10px] tracking-wider text-gray-400 uppercase">
              Por sucursal:
            </span>
            {branchSummaries.map((b) => (
              <span
                key={b.branchId}
                className="inline-flex items-center gap-1 rounded-full bg-red-900/30 px-2 py-0.5 text-[11px] text-red-200"
                title={`${b.branchName}: ${b.count} ${b.count === 1 ? "cuenta" : "cuentas"} · ${formatMXN(b.amount)}`}
              >
                <span className="font-medium text-white">{b.branchName}</span>
                <span className="text-red-300">·</span>
                <span>{b.count}</span>
                <span className="text-red-300">·</span>
                <span className="font-semibold">{formatMXN(b.amount)}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {!isLoading && totalSalesLoaded > 0 && cuentas.length === 0 && (
        <p className="rounded-md border border-green-900/40 bg-green-950/20 p-3 text-center text-sm text-green-300">
          Todas las ventas de este periodo ya fueron recibidas en oficina.
        </p>
      )}

      {cuentas.length > 0 && (
        <ul className="divide-y divide-gray-700 rounded-md border border-gray-700">
          {cuentas.map((cuenta) => (
            <PendingCuentaRow
              key={cuenta.key}
              cuenta={cuenta}
              branches={branches}
              onSelectSale={onSelectSale}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

interface PendingCuentaRowProps {
  cuenta: PendingCuenta;
  branches: Branch[];
  onSelectSale?: (batchId: number) => void;
}

const PendingCuentaRow: React.FC<PendingCuentaRowProps> = ({
  cuenta,
  branches,
  onSelectSale,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { mutateAsync: markReceived, isPending } = useMarkCuentasReceived();

  const total = cuenta.sales.reduce((sum, s) => sum + s.sale.saleTotal, 0);
  const isMerged = cuenta.sales.length > 1;
  const firstBatchId = cuenta.sales[0].batchId;
  const branchName = resolveBranchName(branches, cuenta.branchId);
  const uniqueBranchCount = new Set(
    cuenta.sales.map((s) => s.batchId),
  ).size;

  const handleMarkReceived = async () => {
    await markReceived(
      cuenta.sales.map((s) => ({
        saleId: s.sale.id,
        batchId: s.batchId,
      })),
    );
  };

  return (
    <li className="px-3 py-2 text-sm transition-colors hover:bg-gray-700/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          {isMerged ? (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              title={expanded ? "Ocultar ventas" : "Ver ventas"}
            >
              {expanded ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
            </button>
          ) : (
            <span className="inline-block w-[18px]" />
          )}
          <span className="font-medium text-white">{cuenta.clientName}</span>
          {isMerged && (
            <span
              className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-medium text-red-200"
              title={`${cuenta.sales.length} ventas de ${uniqueBranchCount} ${uniqueBranchCount === 1 ? "remesa" : "remesas"}`}
            >
              {cuenta.sales.length} ventas
            </span>
          )}
          <span className="text-xs text-gray-500">
            {branchName}
            {uniqueBranchCount > 1 ? " · multi-remesa" : ""}
          </span>
          <span className="text-xs text-gray-500">
            {formatHumanDate(cuenta.date)}
          </span>
          <span className="text-xs font-semibold text-red-300">
            {formatMXN(total)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectSale?.(firstBatchId)}
            className="flex items-center gap-1 rounded-md bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-blue-600 hover:text-white"
          >
            <span>Ir a la venta</span>
            <HiArrowUp size={12} />
          </button>
          <button
            onClick={handleMarkReceived}
            disabled={isPending}
            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Marcar recibida"}
          </button>
        </div>
      </div>

      {isMerged && expanded && (
        <ul className="mt-2 ml-6 space-y-1 border-l-2 border-gray-700 pl-3">
          {cuenta.sales.map(({ sale, batchId }) => (
            <li
              key={sale.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400"
            >
              <span className="text-gray-300">
                Remesa #{batchId}
                {sale.clientName ? ` · ${sale.clientName}` : ""}
              </span>
              <span className="font-semibold text-red-300">
                {formatMXN(sale.saleTotal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

interface AvailableRow {
  batch: Batch;
  remaining: number;
}

interface AvailableBranchSummary {
  branchId: number;
  branchName: string;
  remaining: number;
  batchCount: number;
}

interface AvailableTabProps {
  rows: AvailableRow[];
  branches: Branch[];
  totalChickens: number;
  onBatchClick?: (batchId: number) => void;
}

const AvailableTab: React.FC<AvailableTabProps> = ({
  rows,
  branches,
  totalChickens,
  onBatchClick,
}) => {
  const branchSummaries = useMemo<AvailableBranchSummary[]>(() => {
    const map = new Map<number, AvailableBranchSummary>();
    for (const { batch, remaining } of rows) {
      const branchId = batch.branchId ?? -1;
      const entry = map.get(branchId) ?? {
        branchId,
        branchName: resolveBranchName(branches, branchId),
        remaining: 0,
        batchCount: 0,
      };
      entry.remaining += remaining;
      entry.batchCount += 1;
      map.set(branchId, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.remaining - a.remaining);
  }, [rows, branches]);

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-gray-700 bg-gray-900/40 p-3 text-center text-sm text-gray-400">
        No hay disponibilidad en este periodo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-blue-900/40 bg-blue-950/20 p-3">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-wider text-blue-300 uppercase">
              Disponibilidad total
            </p>
            <p className="text-2xl font-bold text-white">
              {totalChickens.toLocaleString("es-MX")} pollos
            </p>
            <p className="text-[11px] text-gray-400">
              en {rows.length} remesa{rows.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {branchSummaries.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-blue-900/30 pt-2">
            <span className="text-[10px] tracking-wider text-gray-400 uppercase">
              Por sucursal:
            </span>
            {branchSummaries.map((b) => (
              <span
                key={b.branchId}
                className="inline-flex items-center gap-1 rounded-full bg-blue-900/30 px-2 py-0.5 text-[11px] text-blue-200"
                title={`${b.branchName}: ${b.remaining.toLocaleString("es-MX")} pollos en ${b.batchCount} ${b.batchCount === 1 ? "remesa" : "remesas"}`}
              >
                <span className="font-medium text-white">{b.branchName}</span>
                <span className="text-blue-300">·</span>
                <span className="font-semibold">
                  {b.remaining.toLocaleString("es-MX")}
                </span>
                <span className="text-blue-300">pollos</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {rows.map(({ batch, remaining }) => {
        const branchName = resolveBranchName(branches, batch.branchId);
        return (
          <div
            key={batch.id}
            className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-gray-700/50"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <GiFeather size={14} className="text-orange-400" />
              <span className="text-sm font-medium text-white">
                {remaining.toLocaleString("es-MX")} pollos
              </span>
              <span className="text-xs text-gray-500">
                de Remesa #{batch.id} · {branchName}
              </span>
              <span className="text-[10px] text-gray-600">
                {formatHumanDate(batch.date)}
              </span>
            </div>
            {onBatchClick && (
              <button
                onClick={() => onBatchClick(batch.id)}
                className="flex items-center gap-1 rounded-md bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-blue-600 hover:text-white"
              >
                <span>Ir</span>
                <HiArrowUp size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

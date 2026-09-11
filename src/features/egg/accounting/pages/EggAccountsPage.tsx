import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, TextInput, ToggleSwitch } from "flowbite-react";
import { HiClock, HiPlus } from "react-icons/hi";
import { HiDocumentDownload, HiQuestionMarkCircle } from "react-icons/hi";

import { RegisterPaymentModal } from "@/features/accounting/components/RegisterPaymentModal";
import { RegisterPaymentFirstModal } from "@/features/accounting/components/RegisterPaymentFirstModal";
import { AccountsOpenTable } from "@/features/accounting/components/AccountsOpenTable";
import { AccountingSummaryCards } from "@/features/accounting/components/AccountingSummaryCards";
import { AccountingErrorAlert } from "@/features/accounting/components/AccountingErrorAlert";
import { AccountingToast } from "@/features/accounting/components/AccountingToast";
import { RecentPaymentsDrawer } from "@/features/accounting/components/RecentPaymentsDrawer";
import { useOpenAccounts } from "@/features/accounting/api/accounts-payable.queries";
import { useAccountingEntities } from "@/features/accounting/api/accounting-entities.queries";
import { AccountDetailDrawer } from "@/features/accounting/components/AccountDetailDrawer";
import { ClientReportDrawer } from "@/features/accounting/components/ClientReportDrawer";
import { CreateAccountsPayableModal } from "@/features/accounting/components/CreateAccountsPayableModal";
import {
  applyAccountSort,
  filterAccountsBySearch,
  type AccountSortKey,
  type SortDir,
} from "@/features/accounting/utils/openAccounts";
import { useClients } from "@/core/client/api/client.queries";
import { useSuppliers } from "@/core/supplier/supplier.queries";
import SupplierMultiSelect from "@/components/SupplierMultiSelect";
import InternalClientMultiSelect from "@/components/InternalClientMultiSelect";
import { EntityMultiSelect } from "@/components/EntityMultiSelect";
import DateRangeFilter, { type DateRange } from "@/components/DateRangeFilter";
import { formatDateToISO, formatUiDate, getLastDays } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { CedisFinancialSummary } from "@/features/branches/accounting/components/CedisFinancialSummary";
import {
  exportAccountStatementPdf,
  exportClientMonthlyPdf,
  exportOpenAccountsPdf,
} from "../utils/openAccountsPdf";
import {
  AntiguedadHelpContent,
  DocumentosHelpContent,
  SaldoColumnaHelpContent,
  TotalPendienteHelpContent,
} from "../components/EggAccountingHelpContent";
import { toEggCedisOptions } from "../utils/eggCedisOptions";

type ViewMode = "RECEIVABLE" | "PAYABLE" | "FINANCIAL";

const PAGE_SIZE = 20;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const parseIds = (value: string | null): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
};

export const EggAccountsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);

  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);
  const [selectedAccountForReport, setSelectedAccountForReport] =
    useState<AccountsPayableResponse | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const initialMode = (searchParams.get("mode") as ViewMode) || "RECEIVABLE";
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialMode === "PAYABLE" || initialMode === "FINANCIAL"
      ? initialMode
      : "RECEIVABLE",
  );
  const [selectedClients, setSelectedClients] = useState<number[]>(() =>
    parseIds(searchParams.get("client")),
  );
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>(() =>
    parseIds(searchParams.get("supplier")),
  );
  const [selectedCedis, setSelectedCedis] = useState<number[]>(() =>
    parseIds(searchParams.get("cedis")),
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [reportRange, setReportRange] = useState<
    { from: string; to: string } | undefined
  >(() => {
    const from = searchParams.get("reportFrom");
    const to = searchParams.get("reportTo");
    if (from && to) return { from, to };
    const legacyMonth = searchParams.get("reportMonth");
    if (legacyMonth && /^\d{4}-\d{2}$/.test(legacyMonth)) {
      const [year, month] = legacyMonth.split("-").map(Number);
      if (month >= 1 && month <= 12) {
        const lastDay = new Date(year, month, 0).getDate();
        const mm = String(month).padStart(2, "0");
        return {
          from: `${year}-${mm}-01`,
          to: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
        };
      }
    }
    return undefined;
  });
  const [sortKey, setSortKey] = useState<AccountSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentFirstOpen, setIsPaymentFirstOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const defaultRange = useMemo(() => getLastDays(30), []);
  const defaultReportRange = useMemo(
    () => ({
      from: formatDateToISO(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      ),
      to: formatDateToISO(new Date()),
    }),
    [],
  );
  const effectiveReportRange = reportRange ?? defaultReportRange;
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from && to) {
      const start = new Date(`${from}T00:00:00`);
      const end = new Date(`${to}T00:00:00`);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return { start, end };
      }
    }
    return defaultRange;
  });

  const { data: clients = [] } = useClients();
  const { data: suppliers = [] } = useSuppliers();
  const { data: eggCedisEntities = [] } = useAccountingEntities("EGGCEDIS");

  const internalClients = clients.filter((c) => c.isInternalBranch);
  const eggCedisOptions = useMemo(
    () => toEggCedisOptions(eggCedisEntities),
    [eggCedisEntities],
  );
  const allCedisIds = useMemo(
    () => eggCedisOptions.map((c) => c.id),
    [eggCedisOptions],
  );

  useEffect(() => {
    if (selectedCedis.length === 0 && allCedisIds.length > 0) {
      const fromUrl = parseIds(searchParams.get("cedis"));
      if (fromUrl.length === 0) {
        setSelectedCedis(allCedisIds);
      }
    }
  }, [allCedisIds, selectedCedis.length, searchParams]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("mode", viewMode);
    if (selectedCedis.length > 0) next.set("cedis", selectedCedis.join(","));
    if (selectedClients.length > 0)
      next.set("client", selectedClients.join(","));
    if (selectedSuppliers.length > 0)
      next.set("supplier", selectedSuppliers.join(","));
    next.set("from", formatDateToISO(dateRange.start));
    next.set("to", formatDateToISO(dateRange.end));
    if (search.trim()) next.set("q", search.trim());
    if (reportRange) {
      next.set("reportFrom", reportRange.from);
      next.set("reportTo", reportRange.to);
    }
    setSearchParams(next, { replace: true });
  }, [
    viewMode,
    selectedCedis,
    selectedClients,
    selectedSuppliers,
    dateRange,
    search,
    reportRange,
    setSearchParams,
  ]);

  const receivable = viewMode === "RECEIVABLE";
  const isFinancial = viewMode === "FINANCIAL";
  const [showFinancialDates, setShowFinancialDates] = useState(false);

  const handleSetViewMode = (next: ViewMode) => {
    if (next === viewMode) return;
    setViewMode(next);
    setPage(0);
    setSelectedIds([]);
    if (next === "RECEIVABLE") {
      setSelectedSuppliers([]);
    } else if (next === "PAYABLE") {
      setSelectedClients([]);
    }
  };

  const handlePay = (account: AccountsPayableResponse) => {
    setSelectedAccountForPay(account);
  };

  const openDetail = (account: AccountsPayableResponse) => {
    setSelectedAccountForHistory(account);
    setHistoryOpen(true);
  };

  const handleViewClient = openDetail;

  const cedisFilter =
    selectedCedis.length > 0
      ? selectedCedis
      : allCedisIds.length > 0
        ? allCedisIds
        : undefined;

  const queryParams = receivable
    ? {
        creditorOriginalIds: cedisFilter,
        creditorEntityType: "EGGCEDIS",
        debtorIds: selectedClients.length > 0 ? selectedClients : undefined,
        from: formatDateToISO(dateRange.start),
        to: formatDateToISO(dateRange.end),
      }
    : {
        debtorOriginalIds: cedisFilter,
        debtorEntityType: "EGGCEDIS",
        creditorOriginalIds:
          selectedSuppliers.length > 0 ? selectedSuppliers : undefined,
        creditorEntityType: "SUPPLIER" as const,
        from: formatDateToISO(dateRange.start),
        to: formatDateToISO(dateRange.end),
      };

  const {
    data = [],
    isLoading,
    isError: accountsError,
    error: accountsErrorDetail,
    refetch: refetchAccounts,
  } = useOpenAccounts(queryParams);

  const paymentFirstPrimaryParams = receivable
    ? {
        creditorOriginalIds: cedisFilter,
        creditorEntityType: "EGGCEDIS",
      }
    : {
        debtorOriginalIds: cedisFilter,
        debtorEntityType: "EGGCEDIS",
      };

  const paymentFirstSecondaryParams = receivable
    ? {
        debtorOriginalIds: cedisFilter,
        debtorEntityType: "EGGCEDIS",
      }
    : {
        creditorOriginalIds: cedisFilter,
        creditorEntityType: "EGGCEDIS",
      };

  const {
    data: paymentFirstPrimary = [],
    isLoading: paymentFirstPrimaryLoading,
  } = useOpenAccounts(paymentFirstPrimaryParams);
  const {
    data: paymentFirstSecondary = [],
    isLoading: paymentFirstSecondaryLoading,
  } = useOpenAccounts(paymentFirstSecondaryParams);

  const filtered = useMemo(
    () =>
      applyAccountSort(filterAccountsBySearch(data, search), sortKey, sortDir),
    [data, search, sortKey, sortDir],
  );

  const selectedRows = useMemo(
    () => filtered.filter((r) => selectedIds.includes(r.id)),
    [filtered, selectedIds],
  );
  const selectedTotal = useMemo(
    () => selectedRows.reduce((sum, r) => sum + (r.balance ?? 0), 0),
    [selectedRows],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const dateRangeModified = !(
    isSameDay(dateRange.start, defaultRange.start) &&
    isSameDay(dateRange.end, defaultRange.end)
  );
  const roleFilterActive = receivable
    ? selectedClients.length > 0
    : selectedSuppliers.length > 0;
  const cedisModified =
    selectedCedis.length > 0 && selectedCedis.length !== allCedisIds.length;
  const hasFilter =
    roleFilterActive ||
    dateRangeModified ||
    cedisModified ||
    search.trim() !== "";

  const clearFilters = () => {
    setSelectedClients([]);
    setSelectedSuppliers([]);
    setSelectedCedis(allCedisIds);
    setDateRange(defaultRange);
    setSearch("");
    setPage(0);
    setSelectedIds([]);
  };

  const widenDateRange = () => {
    setDateRange(getLastDays(90));
    setPage(0);
  };

  const handleExportPdf = () => {
    exportOpenAccountsPdf(
      filtered,
      receivable ? "Huevo · Cuentas por cobrar" : "Huevo · Cuentas por pagar",
      receivable
        ? `cuentas-huevo-por-cobrar-${formatDateToISO(new Date())}`
        : `cuentas-huevo-por-pagar-${formatDateToISO(new Date())}`,
    );
  };

  const tabButton = (mode: ViewMode, label: string) => (
    <Button
      key={mode}
      color={viewMode === mode ? "blue" : "gray"}
      onClick={() => handleSetViewMode(mode)}
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-6 p-6">
      <AccountingToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Contabilidad de Huevo
          </h1>
          <p className="text-sm text-gray-400">
            Cuentas por cobrar y por pagar de los CEDIS de huevo
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="help">
            <Button color="gray">
              <HiQuestionMarkCircle className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
          </Link>
          <Button color="gray" onClick={() => setIsRecentOpen(true)}>
            <HiClock className="mr-2 h-4 w-4" />
            Pagos recientes
          </Button>
          <Button color="gray" onClick={() => setIsPaymentFirstOpen(true)}>
            <HiPlus className="mr-2 h-4 w-4" />
            Registrar pago
          </Button>
          <Button onClick={() => setOpenCreateModal(true)}>Crear Cuenta</Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Modo de contabilidad"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {tabButton("RECEIVABLE", "Por cobrar")}
        {tabButton("PAYABLE", "Por pagar")}
        {tabButton("FINANCIAL", "Resumen financiero")}
      </div>

      {isFinancial && (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="w-72">
            <EntityMultiSelect
              items={eggCedisOptions}
              selected={selectedCedis}
              onChange={(ids) => setSelectedCedis(ids)}
              label="CEDIS de huevo"
              placeholder="Seleccionar CEDIS"
            />
          </div>
          <ToggleSwitch
            checked={showFinancialDates}
            label="Filtrar por fechas"
            onChange={setShowFinancialDates}
          />
          {showFinancialDates && (
            <DateRangeFilter
              value={dateRange}
              defaultRange={defaultRange}
              onChange={setDateRange}
            />
          )}
        </div>
      )}

      {viewMode === "FINANCIAL" ? (
        <CedisFinancialSummary
          cedisIds={selectedCedis.length > 0 ? selectedCedis : undefined}
          entityType="EGGCEDIS"
          from={
            showFinancialDates ? formatDateToISO(dateRange.start) : undefined
          }
          to={showFinancialDates ? formatDateToISO(dateRange.end) : undefined}
        />
      ) : (
        <>
          <AccountingSummaryCards
            data={filtered}
            filterLabel={hasFilter ? "Filtrado" : "Consolidado"}
            tooltips={{
              total: <TotalPendienteHelpContent />,
              count: <DocumentosHelpContent />,
              antiquity: <AntiguedadHelpContent />,
            }}
          />

          <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="w-72">
              <EntityMultiSelect
                items={eggCedisOptions}
                selected={selectedCedis}
                onChange={(ids) => {
                  setSelectedCedis(ids);
                  setPage(0);
                }}
                label="CEDIS de huevo"
                placeholder="Seleccionar CEDIS"
              />
            </div>
            {receivable ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">
                  Clientes internos:
                </span>
                <div className="w-80">
                  <InternalClientMultiSelect
                    clients={internalClients}
                    selected={selectedClients}
                    onChange={(ids) => {
                      setSelectedClients(ids);
                      setPage(0);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">
                  Proveedores:
                </span>
                <div className="w-80">
                  <SupplierMultiSelect
                    suppliers={suppliers}
                    selected={selectedSuppliers}
                    onChange={(ids) => {
                      setSelectedSuppliers(ids);
                      setPage(0);
                    }}
                  />
                </div>
              </div>
            )}

            <DateRangeFilter
              value={dateRange}
              defaultRange={defaultRange}
              onChange={(r) => {
                setDateRange(r);
                setPage(0);
              }}
            />

            <div className="flex w-64 flex-col gap-1">
              <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                Buscar
              </span>
              <TextInput
                placeholder="Cliente, monto, folio, nota…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <p className="text-[11px] text-gray-500 italic">
              Ordena con los encabezados de la tabla: Fecha, Total, Saldo.
            </p>

            <Button color="gray" onClick={handleExportPdf}>
              <HiDocumentDownload className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>

            {hasFilter && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="rounded-lg bg-gray-800 shadow">
            {isLoading ? (
              <p className="p-6 text-sm text-gray-500">Cargando...</p>
            ) : accountsError ? (
              <div className="p-6">
                <AccountingErrorAlert
                  error={accountsErrorDetail}
                  onRetry={() => refetchAccounts()}
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="space-y-3 p-6 text-center">
                <p className="text-sm text-gray-400">
                  {hasFilter
                    ? `No hay cuentas creadas entre ${formatUiDate(dateRange.start, "short")} y ${formatUiDate(dateRange.end, "short")} para los filtros seleccionados.`
                    : "No hay cuentas abiertas."}
                </p>
                {hasFilter && (
                  <div className="flex justify-center gap-2">
                    <Button size="xs" color="gray" onClick={widenDateRange}>
                      Ampliar a 90 días
                    </Button>
                    <Button size="xs" color="gray" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {selectedRows.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 bg-gray-900/60 px-4 py-2 text-sm">
                    <span className="text-gray-300">
                      {selectedRows.length} seleccionadas · saldo total{" "}
                      <strong className="text-white">
                        {formatMXN(selectedTotal)}
                      </strong>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        onClick={() => setIsPaymentFirstOpen(true)}
                      >
                        Registrar pagos
                      </Button>
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => setSelectedIds([])}
                      >
                        Quitar selección
                      </Button>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <AccountsOpenTable
                    data={paged}
                    onPay={handlePay}
                    onViewClient={handleViewClient}
                    onViewClientReport={(acc) =>
                      setSelectedAccountForReport(acc)
                    }
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSortChange={(key, dir) => {
                      setSortKey(key);
                      setSortDir(dir);
                    }}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    headerTooltips={{
                      balance: <SaldoColumnaHelpContent />,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 text-xs text-gray-400">
                  <span>
                    {filtered.length} cuentas · creadas entre{" "}
                    {formatUiDate(dateRange.start, "short")} y{" "}
                    {formatUiDate(dateRange.end, "short")} · página{" "}
                    {safePage + 1} de {pageCount}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color="gray"
                      disabled={safePage === 0}
                      onClick={() => setPage(safePage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="xs"
                      color="gray"
                      disabled={safePage >= pageCount - 1}
                      onClick={() => setPage(safePage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </>
            )}
            <AccountDetailDrawer
              open={historyOpen}
              onClose={() => setHistoryOpen(false)}
              account={selectedAccountForHistory}
              mode={receivable ? "RECEIVABLE" : "PAYABLE"}
              onPay={handlePay}
              onExportPdf={(acc, movs) => exportAccountStatementPdf(acc, movs)}
              onOpenClientReport={(acc) => setSelectedAccountForReport(acc)}
              onSuccessToast={setToastMessage}
            />
          </div>
        </>
      )}

      <CreateAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      <RegisterPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
        cedisList={cedisFilter}
        creditorEntity="EGGCEDIS"
        allowCompensation={receivable}
        onSuccessToast={setToastMessage}
      />

      <RegisterPaymentFirstModal
        open={isPaymentFirstOpen}
        onClose={() => setIsPaymentFirstOpen(false)}
        onSuccessToast={setToastMessage}
        side={receivable ? "RECEIVABLE" : "PAYABLE"}
        allowCompensation={receivable}
        primaryAccounts={
          selectedRows.length > 0 ? selectedRows : paymentFirstPrimary
        }
        secondaryAccounts={paymentFirstSecondary}
        primaryLoading={paymentFirstPrimaryLoading}
        secondaryLoading={paymentFirstSecondaryLoading}
      />

      <RecentPaymentsDrawer
        open={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        onSuccessToast={setToastMessage}
      />

      <ClientReportDrawer
        open={!!selectedAccountForReport}
        onClose={() => setSelectedAccountForReport(null)}
        debtorEntityId={selectedAccountForReport?.debtorId}
        debtorName={selectedAccountForReport?.debtorName}
        from={effectiveReportRange.from}
        to={effectiveReportRange.to}
        onRangeChange={(from, to) => setReportRange({ from, to })}
        onExportPdf={(input) => exportClientMonthlyPdf(input)}
      />
    </div>
  );
};

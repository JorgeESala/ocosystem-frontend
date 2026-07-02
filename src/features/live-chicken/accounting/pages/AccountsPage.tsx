import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { HiClock, HiPlus } from "react-icons/hi";

import { CreateAccountsPayableModal } from "../../../accounting/components/CreateAccountsPayableModal";
import { RegisterPaymentModal } from "../../../accounting/components/RegisterPaymentModal";
import { RegisterPaymentFirstModal } from "../../../accounting/components/RegisterPaymentFirstModal";
import { AccountsOpenTable } from "../../../accounting/components/AccountsOpenTable";
import { AccountingSummaryCards } from "../../../accounting/components/AccountingSummaryCards";
import { AccountingErrorAlert } from "../../../accounting/components/AccountingErrorAlert";
import { AccountingToast } from "../../../accounting/components/AccountingToast";
import { RecentPaymentsDrawer } from "../../../accounting/components/RecentPaymentsDrawer";
import { useOpenAccounts } from "../../../accounting/api/accounts-payable.queries";
import type { AccountsPayableResponse } from "../accounts-payable/types";
import { AccountsPayableHistoryDrawer } from "../../../accounting/components/AccountsPayableHistoryDrawer";
import { useClients } from "@/core/client/api/client.queries";
import { useSuppliers } from "@/core/supplier/supplier.queries";
import SupplierMultiSelect from "@/components/SupplierMultiSelect";
import InternalClientMultiSelect from "@/components/InternalClientMultiSelect";
import DateRangeFilter, {
  type DateRange,
} from "@/components/DateRangeFilter";
import { formatDateToISO, getLastDays } from "@/utils/date.utils";
import { WeeklyWeightDiffTable } from "../weight-diff/WeeklyWeightDiffTable";
import { WeightDiffSummaryCards } from "../weight-diff/WeightDiffSummaryCards";
import { WeightDiffToolbar } from "../weight-diff/WeightDiffToolbar";
import { useWeeklyWeightDiff } from "../weight-diff/weight-diff.queries";

const CEDIS_ID = 2;

type ViewMode = "RECEIVABLE" | "PAYABLE" | "WEIGHT_DIFF";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfIsoWeek = (d: Date): Date => {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
};

const endOfIsoWeek = (d: Date): Date => {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (6 - diff));
};

const snapToFullWeeks = (): DateRange => {
  const end = endOfIsoWeek(new Date());
  const rawStart = new Date();
  rawStart.setDate(end.getDate() - 30);
  const start = startOfIsoWeek(rawStart);
  return { start, end };
};

export const AccountsPage = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);

  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("RECEIVABLE");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [selectedWeightDiffSupplier, setSelectedWeightDiffSupplier] =
    useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentFirstOpen, setIsPaymentFirstOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const defaultRange = useMemo(() => getLastDays(30), []);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);

  const defaultWeightDiffRange = useMemo(() => snapToFullWeeks(), []);
  const [weightDiffDateRange, setWeightDiffDateRange] = useState<DateRange>(
    defaultWeightDiffRange,
  );

  const { data: clients = [] } = useClients();
  const { data: suppliers = [] } = useSuppliers();

  const internalClients = clients.filter((c) => c.isInternalBranch);

  const receivable = viewMode === "RECEIVABLE";
  const isWeightDiff = viewMode === "WEIGHT_DIFF";

  const handleSetViewMode = (next: ViewMode) => {
    if (next === viewMode) return;
    setViewMode(next);
    if (next === "RECEIVABLE") {
      setSelectedSuppliers([]);
    } else if (next === "PAYABLE") {
      setSelectedClients([]);
    }
  };

  const handlePay = (account: AccountsPayableResponse) => {
    setSelectedAccountForPay(account);
  };

  const handleViewHistory = (account: AccountsPayableResponse) => {
    setSelectedAccountForHistory(account);
    setHistoryOpen(true);
  };

  const startIso = formatDateToISO(dateRange.start);
  const endIso = formatDateToISO(dateRange.end);

  const weightDiffStartIso = formatDateToISO(weightDiffDateRange.start);
  const weightDiffEndIso = formatDateToISO(weightDiffDateRange.end);

  const queryParams = receivable
    ? {
        creditorId: CEDIS_ID,
        debtorIds: selectedClients.length > 0 ? selectedClients : undefined,
        debtorEntityType: "BRANCH" as const,
        from: startIso,
        to: endIso,
      }
    : {
        debtorId: CEDIS_ID,
        creditorOriginalIds:
          selectedSuppliers.length > 0 ? selectedSuppliers : undefined,
        creditorEntityType: "SUPPLIER" as const,
        from: startIso,
        to: endIso,
      };

  const {
    data = [],
    isLoading,
    isError: accountsError,
    error: accountsErrorDetail,
    refetch: refetchAccounts,
  } = useOpenAccounts(queryParams);

  const paymentFirstPrimaryParams = receivable
    ? { creditorId: CEDIS_ID }
    : { debtorId: CEDIS_ID };

  const paymentFirstSecondaryParams = receivable
    ? { debtorId: CEDIS_ID }
    : { creditorId: CEDIS_ID };

  const {
    data: paymentFirstPrimary = [],
    isLoading: paymentFirstPrimaryLoading,
  } = useOpenAccounts(paymentFirstPrimaryParams);
  const {
    data: paymentFirstSecondary = [],
    isLoading: paymentFirstSecondaryLoading,
  } = useOpenAccounts(paymentFirstSecondaryParams);

  const {
    data: weightDiffRows = [],
    isLoading: weightDiffLoading,
    isError: weightDiffError,
    error: weightDiffErrorDetail,
    refetch: refetchWeightDiff,
  } = useWeeklyWeightDiff(weightDiffStartIso, weightDiffEndIso);

  const filteredWeightDiffRows = selectedWeightDiffSupplier == null
    ? weightDiffRows
    : weightDiffRows.filter((r) => r.supplierId === selectedWeightDiffSupplier);

  const dateRangeModified = !(
    isSameDay(dateRange.start, defaultRange.start) &&
    isSameDay(dateRange.end, defaultRange.end)
  );
  const weightDiffDateRangeModified = !(
    isSameDay(weightDiffDateRange.start, defaultWeightDiffRange.start) &&
    isSameDay(weightDiffDateRange.end, defaultWeightDiffRange.end)
  );
  const roleFilterActive = receivable
    ? selectedClients.length > 0
    : selectedSuppliers.length > 0;
  const hasFilter = roleFilterActive || dateRangeModified;

  return (
    <div className="space-y-6 p-6">
      <AccountingToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Contabilidad de Pollo Vivo
          </h1>
          <p className="text-sm text-gray-400">
            Cuentas por cobrar y por pagar del CEDIS de pollo vivo
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            color="gray"
            onClick={() => setIsRecentOpen(true)}
          >
            <HiClock className="mr-2 h-4 w-4" />
            Pagos recientes
          </Button>
          <Button
            color="gray"
            onClick={() => setIsPaymentFirstOpen(true)}
          >
            <HiPlus className="mr-2 h-4 w-4" />
            Registrar pago
          </Button>
          <Button onClick={() => setOpenCreateModal(true)}>Crear Cuenta</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          color={viewMode === "RECEIVABLE" ? "blue" : "gray"}
          onClick={() => handleSetViewMode("RECEIVABLE")}
        >
          Por cobrar
        </Button>

        <Button
          color={viewMode === "PAYABLE" ? "blue" : "gray"}
          onClick={() => handleSetViewMode("PAYABLE")}
        >
          Por pagar
        </Button>

        <Button
          color={viewMode === "WEIGHT_DIFF" ? "blue" : "gray"}
          onClick={() => handleSetViewMode("WEIGHT_DIFF")}
        >
          Diferencia de peso
        </Button>
      </div>

      {!isWeightDiff && (
        <>
          <AccountingSummaryCards
            data={data}
            filterLabel={hasFilter ? "Filtrado" : "Consolidado"}
          />

          <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-center">
            {receivable ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">
                  Clientes internos:
                </span>
                <div className="w-80">
                  <InternalClientMultiSelect
                    clients={internalClients}
                    selected={selectedClients}
                    onChange={setSelectedClients}
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
                    onChange={setSelectedSuppliers}
                  />
                </div>
              </div>
            )}

            <DateRangeFilter
              value={dateRange}
              defaultRange={defaultRange}
              onChange={setDateRange}
            />

            {hasFilter && (
              <button
                onClick={() => {
                  if (receivable) {
                    setSelectedClients([]);
                  } else {
                    setSelectedSuppliers([]);
                  }
                  setDateRange(defaultRange);
                }}
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
            ) : data.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">
                {hasFilter
                  ? "No hay cuentas para los filtros seleccionados."
                  : "No hay cuentas abiertas."}
              </p>
            ) : (
              <AccountsOpenTable
                data={data}
                onPay={handlePay}
                onViewHistory={handleViewHistory}
              />
            )}
            <AccountsPayableHistoryDrawer
              open={historyOpen}
              onClose={() => setHistoryOpen(false)}
              account={selectedAccountForHistory}
            />
          </div>
        </>
      )}

      {isWeightDiff && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-end">
            <DateRangeFilter
              value={weightDiffDateRange}
              defaultRange={defaultWeightDiffRange}
              onChange={setWeightDiffDateRange}
            />
            <WeightDiffToolbar
              rows={weightDiffRows}
              startDate={weightDiffStartIso}
              endDate={weightDiffEndIso}
              onSupplierChange={setSelectedWeightDiffSupplier}
            />
            {weightDiffDateRangeModified && (
              <button
                onClick={() => setWeightDiffDateRange(snapToFullWeeks())}
                className="text-xs text-blue-400 hover:underline"
              >
                Restablecer (ultimas 5 semanas)
              </button>
            )}
          </div>

          {weightDiffLoading ? (
            <p className="p-6 text-sm text-gray-500">Cargando...</p>
          ) : weightDiffError ? (
            <div className="rounded-lg bg-gray-800 p-4 shadow">
              <div className="p-6">
                <AccountingErrorAlert
                  error={weightDiffErrorDetail}
                  onRetry={() => refetchWeightDiff()}
                />
              </div>
            </div>
          ) : (
            <>
              <WeightDiffSummaryCards rows={filteredWeightDiffRows} />
              <div className="rounded-lg bg-gray-800 p-4 shadow">
                <p className="mb-3 text-xs text-gray-500 italic">
                  Diferencia = peso declarado − peso real. El rango se ajusta
                  a semanas completas (lunes a domingo). Haz clic en una
                  fila para ver las remesas que la componen.
                </p>
                <WeeklyWeightDiffTable
                  rows={filteredWeightDiffRows}
                  selectedStart={weightDiffStartIso}
                  selectedEnd={weightDiffEndIso}
                />
              </div>
            </>
          )}
        </div>
      )}

      <CreateAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      <RegisterPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
        allowCompensation={receivable}
        onSuccessToast={setToastMessage}
      />

      <RegisterPaymentFirstModal
        open={isPaymentFirstOpen}
        onClose={() => setIsPaymentFirstOpen(false)}
        onSuccessToast={setToastMessage}
        side={receivable ? "RECEIVABLE" : "PAYABLE"}
        allowCompensation={receivable}
        primaryAccounts={paymentFirstPrimary}
        secondaryAccounts={paymentFirstSecondary}
        primaryLoading={paymentFirstPrimaryLoading}
        secondaryLoading={paymentFirstSecondaryLoading}
      />

      <RecentPaymentsDrawer
        open={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        onSuccessToast={setToastMessage}
      />
    </div>
  );
};

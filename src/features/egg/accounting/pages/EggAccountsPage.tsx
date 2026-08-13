import { useMemo, useState } from "react";
import { Button, ToggleSwitch } from "flowbite-react";
import { HiClock, HiPlus } from "react-icons/hi";

import { RegisterPaymentModal } from "../../../accounting/components/RegisterPaymentModal";
import { RegisterPaymentFirstModal } from "../../../accounting/components/RegisterPaymentFirstModal";
import { AccountsOpenTable } from "../../../accounting/components/AccountsOpenTable";
import { AccountingSummaryCards } from "../../../accounting/components/AccountingSummaryCards";
import { AccountingErrorAlert } from "../../../accounting/components/AccountingErrorAlert";
import { AccountingToast } from "../../../accounting/components/AccountingToast";
import { RecentPaymentsDrawer } from "../../../accounting/components/RecentPaymentsDrawer";
import { useOpenAccounts } from "../../../accounting/api/accounts-payable.queries";
import { AccountsPayableHistoryDrawer } from "../../../accounting/components/AccountsPayableHistoryDrawer";
import { useClients } from "@/core/client/api/client.queries";
import { useSuppliers } from "@/core/supplier/supplier.queries";
import SupplierMultiSelect from "@/components/SupplierMultiSelect";
import InternalClientMultiSelect from "@/components/InternalClientMultiSelect";
import DateRangeFilter, { type DateRange } from "@/components/DateRangeFilter";
import { formatDateToISO, getLastDays } from "@/utils/date.utils";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { CreateEggAccountsPayableModal } from "../components/CreateEggAccountsPayableModal";
import { CedisFinancialSummary } from "@/features/branches/accounting/components/CedisFinancialSummary";

const EGG_CEDIS_ORIGINAL_ID = 1;
const EGG_CEDIS_CHUNHUHUB_ID = 3;
const EGG_CEDIS_MORELOS_ID = 2;
const EGG_CEDIS_IDS = [
  EGG_CEDIS_ORIGINAL_ID,
  EGG_CEDIS_CHUNHUHUB_ID,
  EGG_CEDIS_MORELOS_ID,
];

type ViewMode = "RECEIVABLE" | "PAYABLE" | "FINANCIAL";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const EggAccountsPage = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);

  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("RECEIVABLE");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentFirstOpen, setIsPaymentFirstOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const defaultRange = useMemo(() => getLastDays(30), []);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);

  const { data: clients = [] } = useClients();
  const { data: suppliers = [] } = useSuppliers();

  const internalClients = clients.filter((c) => c.isInternalBranch);

  const receivable = viewMode === "RECEIVABLE";
  const isFinancial = viewMode === "FINANCIAL";
  const [showFinancialDates, setShowFinancialDates] = useState(false);

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

  const queryParams = receivable
    ? {
        creditorOriginalIds: EGG_CEDIS_IDS,
        creditorEntityType: "EGGCEDIS",
        debtorIds: selectedClients.length > 0 ? selectedClients : undefined,
        debtorEntityType: "BRANCH" as const,
        from: formatDateToISO(dateRange.start),
        to: formatDateToISO(dateRange.end),
      }
    : {
        debtorOriginalIds: EGG_CEDIS_IDS,
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
        creditorOriginalIds: EGG_CEDIS_IDS,
        creditorEntityType: "EGGCEDIS",
      }
    : {
        debtorOriginalIds: EGG_CEDIS_IDS,
        debtorEntityType: "EGGCEDIS",
      };

  const paymentFirstSecondaryParams = receivable
    ? {
        debtorOriginalIds: EGG_CEDIS_IDS,
        debtorEntityType: "EGGCEDIS",
      }
    : {
        creditorOriginalIds: EGG_CEDIS_IDS,
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

  const dateRangeModified = !(
    isSameDay(dateRange.start, defaultRange.start) &&
    isSameDay(dateRange.end, defaultRange.end)
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
            Contabilidad de Huevo
          </h1>
          <p className="text-sm text-gray-400">
            Cuentas por cobrar y por pagar de los CEDIS de huevo
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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

      <div className="flex gap-2">
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
          color={viewMode === "FINANCIAL" ? "blue" : "gray"}
          onClick={() => handleSetViewMode("FINANCIAL")}
        >
          Resumen financiero
        </Button>
      </div>

      {isFinancial && (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-center">
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
          entityType="EGGCEDIS"
          from={
            showFinancialDates ? formatDateToISO(dateRange.start) : undefined
          }
          to={showFinancialDates ? formatDateToISO(dateRange.end) : undefined}
        />
      ) : (
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

      <CreateEggAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      <RegisterPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
        cedisList={EGG_CEDIS_IDS}
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

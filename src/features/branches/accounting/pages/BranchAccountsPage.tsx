import { useMemo, useState } from "react";
import { Button, ToggleSwitch } from "flowbite-react";
import { HiClock, HiPlus } from "react-icons/hi";

import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { useOpenAccounts } from "@/features/accounting/api/accounts-payable.queries";
import { AccountsPayableHistoryDrawer } from "@/features/accounting/components/AccountsPayableHistoryDrawer";
import { AccountingSummaryCards } from "@/features/accounting/components/AccountingSummaryCards";
import { AccountingErrorAlert } from "@/features/accounting/components/AccountingErrorAlert";
import { AccountingToast } from "@/features/accounting/components/AccountingToast";
import { RegisterPaymentFirstModal } from "@/features/accounting/components/RegisterPaymentFirstModal";
import { RecentPaymentsDrawer } from "@/features/accounting/components/RecentPaymentsDrawer";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import DateRangeFilter, {
  type DateRange,
} from "@/components/DateRangeFilter";
import { formatDateToISO, getLastDays } from "@/utils/date.utils";
import { RegisterBranchPaymentModal } from "../components/RegisterBranchPaymentModal";
import { CreateBranchAccountsPayableModal } from "../components/CreateBranchAccountsPayableModal";
import { BranchesAccountsOpenTable } from "../components/BranchesAccountsOpenTable";
import { BranchesAccountingSummary } from "../components/BranchesAccountingSummary";
import { useBranches } from "../../branch/branch.queries";

type ViewMode = "PAYABLE" | "FINANCIAL";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const BranchAccountsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("PAYABLE");
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const { data: branches, isLoading: loadingBranches } = useBranches();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);
  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPaymentFirstOpen, setIsPaymentFirstOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const defaultRange = useMemo(() => getLastDays(30), []);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);
  const [showFinancialDates, setShowFinancialDates] = useState(false);

  const {
    data = [],
    isLoading: loadingAccounts,
    isError: accountsError,
    error: accountsErrorDetail,
    refetch: refetchAccounts,
  } = useOpenAccounts({
    debtorOriginalIds:
      selectedBranches.length > 0 ? selectedBranches : undefined,
    debtorEntityType: "BRANCH",
    from: formatDateToISO(dateRange.start),
    to: formatDateToISO(dateRange.end),
  });

  const {
    data: paymentFirstPrimary = [],
    isLoading: paymentFirstPrimaryLoading,
  } = useOpenAccounts({
    debtorEntityType: "BRANCH",
  });

  const handlePay = (account: AccountsPayableResponse) =>
    setSelectedAccountForPay(account);
  const handleViewHistory = (account: AccountsPayableResponse) => {
    setSelectedAccountForHistory(account);
    setHistoryOpen(true);
  };

  const dateRangeModified = !(
    isSameDay(dateRange.start, defaultRange.start) &&
    isSameDay(dateRange.end, defaultRange.end)
  );
  const hasFilter = selectedBranches.length > 0 || dateRangeModified;
  return (
    <div className="space-y-6 p-6">
      <AccountingToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Header con Título y Botón de Acción Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cuentas de Sucursales
          </h1>
          <p className="text-sm text-gray-400">
            Gestión de cuentas por pagar de sucursales
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            color="gray"
            onClick={() => setIsRecentOpen(true)}
            data-testid="open-recent-payments"
          >
            <HiClock className="mr-2 h-4 w-4" />
            Pagos recientes
          </Button>
          <Button
            onClick={() => setIsPaymentFirstOpen(true)}
            data-testid="open-payment-first"
          >
            <HiPlus className="mr-2 h-4 w-4" />
            Registrar pago
          </Button>
          <Button
            color="gray"
            onClick={() => setOpenCreateModal(true)}
          >
            Crear Nueva Cuenta
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          color={viewMode === "PAYABLE" ? "blue" : "gray"}
          onClick={() => setViewMode("PAYABLE")}
        >
          Por pagar
        </Button>
        <Button
          color={viewMode === "FINANCIAL" ? "blue" : "gray"}
          onClick={() => setViewMode("FINANCIAL")}
        >
          Resumen financiero
        </Button>
      </div>

      {/* Barra de Filtros (compartida entre ambas vistas) */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">
            Sucursales:
          </span>
          <div className="w-80">
            <BranchMultiSelect
              branches={branches ?? []}
              selected={selectedBranches}
              onChange={setSelectedBranches}
            />
          </div>
        </div>

        {viewMode === "FINANCIAL" && (
          <ToggleSwitch
            checked={showFinancialDates}
            label="Filtrar por fechas"
            onChange={setShowFinancialDates}
          />
        )}

        {(viewMode === "PAYABLE" || showFinancialDates) && (
          <DateRangeFilter
            value={dateRange}
            defaultRange={defaultRange}
            onChange={setDateRange}
          />
        )}

        {hasFilter && (
          <button
            onClick={() => {
              setSelectedBranches([]);
              setDateRange(defaultRange);
              setShowFinancialDates(false);
            }}
            className="text-xs text-blue-400 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {viewMode === "PAYABLE" && (
        <>
          <AccountingSummaryCards
            data={data}
            filterLabel={hasFilter ? "Filtrado" : "Consolidado"}
          />

          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            {loadingAccounts || loadingBranches ? (
              <div className="p-12 text-center">
                <p className="animate-pulse text-gray-400">
                  Cargando información consolidada...
                </p>
              </div>
            ) : accountsError ? (
              <div className="p-6">
                <AccountingErrorAlert
                  error={accountsErrorDetail}
                  onRetry={() => refetchAccounts()}
                />
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400">
                  {hasFilter
                    ? "No hay cuentas para los filtros seleccionados."
                    : "No hay cuentas abiertas."}
                </p>
              </div>
            ) : (
              <BranchesAccountsOpenTable
                data={data}
                onPay={handlePay}
                onViewHistory={handleViewHistory}
              />
            )}
          </div>
        </>
      )}

      {viewMode === "FINANCIAL" && (
        <BranchesAccountingSummary
          selectedBranchIds={selectedBranches}
          from={showFinancialDates ? formatDateToISO(dateRange.start) : undefined}
          to={showFinancialDates ? formatDateToISO(dateRange.end) : undefined}
        />
      )}

      {/* Modal: Ver Historial (Drawer o Modal) */}
      <AccountsPayableHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        account={selectedAccountForHistory}
      />

      {/* Modal: Crear Cuenta */}
      <CreateBranchAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        // Opcional: pasar las sucursales seleccionadas como sugerencia
        // suggestedBranchIds={selectedBranches}
      />

      {/* Modal: Registrar Pago */}
      <RegisterBranchPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
        onSuccessToast={setToastMessage}
      />

      {/* Modal: Registrar pago (flujo payment-first) */}
      <RegisterPaymentFirstModal
        open={isPaymentFirstOpen}
        onClose={() => setIsPaymentFirstOpen(false)}
        onSuccessToast={setToastMessage}
        side="PAYABLE"
        allowCompensation={false}
        primaryAccounts={paymentFirstPrimary}
        secondaryAccounts={[]}
        primaryLoading={paymentFirstPrimaryLoading}
        secondaryLoading={false}
      />

      {/* Drawer: Pagos recientes */}
      <RecentPaymentsDrawer
        open={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        onSuccessToast={setToastMessage}
      />
    </div>
  );
};

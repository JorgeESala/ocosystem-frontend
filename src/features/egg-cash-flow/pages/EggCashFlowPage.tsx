import { useMemo, useState } from "react";
import { Alert, Button, Datepicker, Spinner } from "flowbite-react";
import {
  HiCreditCard,
  HiCog,
  HiDownload,
  HiPlus,
  HiReceiptRefund,
  HiScissors,
} from "react-icons/hi";
import { formatDateRange, toLocalDateString } from "@/utils/date.utils";
import { extractErrorMessage } from "@/features/accounting/utils/errorMessage";
import AccountingErrorAlert from "@/features/accounting/components/AccountingErrorAlert";
import {
  useAvailableExpenses,
  useCashFlowCuts,
  useCashFlowMovements,
  useCashFlowSettings,
  useCashFlowSummary,
  useCollectionSuggestions,
  useCreateCashFlowAdjustment,
  useCreateCashFlowCut,
  useCreateCashFlowDeposit,
  useCreateCashFlowExpense,
  useCreateCashFlowIncome,
  useCreateCashFlowRemesaPayment,
  useCreateCashFlowSettings,
  useDeleteCashFlowMovement,
  useRemesas,
  useTripSuggestions,
  useUpdateCashFlowSettings,
} from "../api/eggCashFlow.queries";
import CashFlowBalanceCards from "../components/CashFlowBalanceCards";
import CashFlowMovementsTable from "../components/CashFlowMovementsTable";
import WeeklySummaryCard from "../components/WeeklySummaryCard";
import PendingCollectionsPanel from "../components/PendingCollectionsPanel";
import RemesasPanel from "../components/RemesasPanel";
import CutsPanel from "../components/CutsPanel";
import IncomeModal from "../components/IncomeModal";
import DepositModal from "../components/DepositModal";
import CashExpenseModal from "../components/CashExpenseModal";
import RemesaPaymentModal from "../components/RemesaPaymentModal";
import AdjustmentModal from "../components/AdjustmentModal";
import CutModal from "../components/CutModal";
import SettingsModal from "../components/SettingsModal";
import { currentWeekEnd, currentWeekStart } from "../utils/cashFlow.utils";
import type { EggCashFlowUnit } from "../types/eggCashFlow.types";

interface Props {
  unitType: EggCashFlowUnit;
}

export default function EggCashFlowPage({ unitType }: Props) {
  const weekStart = useMemo(() => currentWeekStart(), []);
  const weekEnd = useMemo(() => currentWeekEnd(), []);

  const [rangeStart, setRangeStart] = useState<Date>(weekStart);
  const [rangeEnd, setRangeEnd] = useState<Date>(weekEnd);
  const [accountFilter, setAccountFilter] = useState<"ALL" | "CASH" | "BANK">(
    "ALL",
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showCashExpense, setShowCashExpense] = useState(false);
  const [showRemesaPayment, setShowRemesaPayment] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showCut, setShowCut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [incomePrefill, setIncomePrefill] = useState<{
    tripId?: number | null;
    paymentId?: number | null;
  } | null>(null);
  const [remesaPrefill, setRemesaPrefill] = useState<number | null>(null);

  const from = toLocalDateString(rangeStart);
  const to = toLocalDateString(rangeEnd);

  const settingsQuery = useCashFlowSettings(unitType);
  const summaryQuery = useCashFlowSummary(unitType, from, to);
  const movementsQuery = useCashFlowMovements(unitType, from, to);
  const tripsQuery = useTripSuggestions(unitType, from, to);
  const collectionsQuery = useCollectionSuggestions(unitType, from, to);
  const remesasQuery = useRemesas(unitType);
  const cutsQuery = useCashFlowCuts(unitType);
  const expensesQuery = useAvailableExpenses(unitType, from, to);

  const createSettings = useCreateCashFlowSettings(unitType);
  const updateSettings = useUpdateCashFlowSettings(unitType);
  const createIncome = useCreateCashFlowIncome(unitType);
  const createDeposit = useCreateCashFlowDeposit(unitType);
  const createExpense = useCreateCashFlowExpense(unitType);
  const createRemesaPayment = useCreateCashFlowRemesaPayment(unitType);
  const createAdjustment = useCreateCashFlowAdjustment(unitType);
  const createCut = useCreateCashFlowCut(unitType);
  const deleteMovement = useDeleteCashFlowMovement(unitType);

  const settings = settingsQuery.data ?? null;
  const summary = summaryQuery.data;
  const accountHolder = settings?.accountHolder ?? "Enrique";

  const handleActionError = (error: unknown) =>
    setActionError(extractErrorMessage(error));

  const handleDelete = (id: number) => {
    deleteMovement.mutate(id, { onError: handleActionError });
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold text-white">
            Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Control de efectivo y cuenta bancaria del negocio de huevo.
          </p>
        </header>
        <AccountingErrorAlert
          error={settingsQuery.error}
          title="No se pudo cargar la configuración"
          onRetry={() => settingsQuery.refetch()}
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold text-white">
            Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Control de efectivo y cuenta bancaria del negocio de huevo.
          </p>
        </header>
        <div className="rounded-xl bg-slate-800 p-10 text-center">
          <h2 className="text-lg font-semibold text-white">
            Configura tu flujo de efectivo
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Define los saldos iniciales de caja chica y caja general, y el
            titular de la cuenta, para empezar a registrar ingresos, depósitos y
            gastos.
          </p>
          <Button
            className="mx-auto mt-4"
            onClick={() => setShowSettings(true)}
          >
            <HiCog className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>
        <SettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={(p) =>
            createSettings.mutate(p, {
              onSuccess: () => setShowSettings(false),
              onError: handleActionError,
            })
          }
          isSaving={createSettings.isPending}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Control de efectivo y cuenta de {accountHolder}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            color="light"
            size="sm"
            onClick={() => {
              setIncomePrefill(null);
              setShowIncome(true);
            }}
          >
            <HiPlus className="mr-1 h-3 w-3" />
            Ingreso
          </Button>
          <Button color="light" size="sm" onClick={() => setShowDeposit(true)}>
            <HiDownload className="mr-1 h-3 w-3" />
            Depósito
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => setShowCashExpense(true)}
          >
            <HiReceiptRefund className="mr-1 h-3 w-3" />
            Gasto efectivo
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => {
              setRemesaPrefill(null);
              setShowRemesaPayment(true);
            }}
          >
            <HiCreditCard className="mr-1 h-3 w-3" />
            Pagar remesa
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => setShowAdjustment(true)}
          >
            Ajuste
          </Button>
          <Button color="yellow" size="sm" onClick={() => setShowCut(true)}>
            <HiScissors className="mr-1 h-3 w-3" />
            Corte de semana
          </Button>
          <Button color="light" size="sm" onClick={() => setShowSettings(true)}>
            <HiCog className="mr-1 h-3 w-3" />
          </Button>
        </div>
      </header>

      {actionError && (
        <Alert
          color="failure"
          onDismiss={() => setActionError(null)}
          className="border border-red-900/40 bg-red-950/40"
        >
          {actionError}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Desde
          </label>
          <Datepicker
            language="es-MX"
            value={rangeStart}
            onChange={(d) => d && setRangeStart(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Hasta
          </label>
          <Datepicker
            language="es-MX"
            value={rangeEnd}
            onChange={(d) => d && setRangeEnd(d)}
          />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button
            color={accountFilter === "ALL" ? "blue" : "gray"}
            size="xs"
            onClick={() => setAccountFilter("ALL")}
          >
            Todas
          </Button>
          <Button
            color={accountFilter === "CASH" ? "blue" : "gray"}
            size="xs"
            onClick={() => setAccountFilter("CASH")}
          >
            Caja chica
          </Button>
          <Button
            color={accountFilter === "BANK" ? "blue" : "gray"}
            size="xs"
            onClick={() => setAccountFilter("BANK")}
          >
            Caja general
          </Button>
        </div>
      </div>

      {summaryQuery.isError && (
        <AccountingErrorAlert
          error={summaryQuery.error}
          title="No se pudo cargar el resumen"
          onRetry={() => summaryQuery.refetch()}
        />
      )}

      {summaryQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <CashFlowBalanceCards
            summary={summary}
            accountHolder={accountHolder}
          />
          <WeeklySummaryCard
            summary={summary}
            rangeLabel={`(${formatDateRange(rangeStart, rangeEnd)})`}
            accountHolder={accountHolder}
          />
        </>
      )}

      {tripsQuery.isError || collectionsQuery.isError ? (
        <AccountingErrorAlert
          error={tripsQuery.error ?? collectionsQuery.error}
          title="No se pudo cargar el estado de cobranza"
          onRetry={() => {
            if (tripsQuery.isError) tripsQuery.refetch();
            if (collectionsQuery.isError) collectionsQuery.refetch();
          }}
        />
      ) : (
        <PendingCollectionsPanel
          trips={tripsQuery.data ?? []}
          collections={collectionsQuery.data ?? []}
          onCollectTrip={(t) => {
            setIncomePrefill({ tripId: t.tripId });
            setShowIncome(true);
          }}
          onCollectPayment={(c) => {
            setIncomePrefill({ paymentId: c.paymentId });
            setShowIncome(true);
          }}
        />
      )}

      {remesasQuery.isError ? (
        <AccountingErrorAlert
          error={remesasQuery.error}
          title="No se pudieron cargar las remesas"
          onRetry={() => remesasQuery.refetch()}
        />
      ) : (
        <RemesasPanel
          remesas={remesasQuery.data ?? []}
          accountHolder={accountHolder}
          onPay={(r) => {
            setRemesaPrefill(r.accountsPayableId);
            setShowRemesaPayment(true);
          }}
        />
      )}

      {movementsQuery.isError ? (
        <AccountingErrorAlert
          error={movementsQuery.error}
          title="No se pudieron cargar los movimientos"
          onRetry={() => movementsQuery.refetch()}
        />
      ) : movementsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <CashFlowMovementsTable
          movements={movementsQuery.data}
          onDelete={handleDelete}
          accountFilter={accountFilter}
        />
      )}

      {cutsQuery.isError ? (
        <AccountingErrorAlert
          error={cutsQuery.error}
          title="No se pudieron cargar los cortes"
          onRetry={() => cutsQuery.refetch()}
        />
      ) : (
        <CutsPanel cuts={cutsQuery.data ?? []} />
      )}

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={(p) =>
          updateSettings.mutate(p, {
            onSuccess: () => setShowSettings(false),
            onError: handleActionError,
          })
        }
        isSaving={updateSettings.isPending}
      />

      <IncomeModal
        open={showIncome}
        onClose={() => {
          setShowIncome(false);
          setIncomePrefill(null);
        }}
        trips={tripsQuery.data ?? []}
        collections={collectionsQuery.data ?? []}
        initialTripId={incomePrefill?.tripId ?? null}
        initialPaymentId={incomePrefill?.paymentId ?? null}
        onSave={(p) =>
          createIncome.mutate(p, {
            onSuccess: () => {
              setShowIncome(false);
              setIncomePrefill(null);
            },
            onError: handleActionError,
          })
        }
        isSaving={createIncome.isPending}
      />

      <DepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        cashBalance={summary?.cashClosingBalance ?? 0}
        onSave={(p) =>
          createDeposit.mutate(p, {
            onSuccess: () => setShowDeposit(false),
            onError: handleActionError,
          })
        }
        isSaving={createDeposit.isPending}
      />

      <CashExpenseModal
        open={showCashExpense}
        onClose={() => setShowCashExpense(false)}
        expenses={expensesQuery.data ?? []}
        error={expensesQuery.isError ? expensesQuery.error : null}
        onRetryExpenses={() => expensesQuery.refetch()}
        onSave={(p) =>
          createExpense.mutate(p, {
            onSuccess: () => setShowCashExpense(false),
            onError: handleActionError,
          })
        }
        isSaving={createExpense.isPending}
      />

      <RemesaPaymentModal
        open={showRemesaPayment}
        onClose={() => {
          setShowRemesaPayment(false);
          setRemesaPrefill(null);
        }}
        remesas={remesasQuery.data ?? []}
        accountHolder={accountHolder}
        initialApId={remesaPrefill}
        onSave={(p) =>
          createRemesaPayment.mutate(p, {
            onSuccess: () => {
              setShowRemesaPayment(false);
              setRemesaPrefill(null);
            },
            onError: handleActionError,
          })
        }
        isSaving={createRemesaPayment.isPending}
      />

      <AdjustmentModal
        open={showAdjustment}
        onClose={() => setShowAdjustment(false)}
        onSave={(p) =>
          createAdjustment.mutate(p, {
            onSuccess: () => setShowAdjustment(false),
            onError: handleActionError,
          })
        }
        isSaving={createAdjustment.isPending}
      />

      <CutModal
        open={showCut}
        onClose={() => setShowCut(false)}
        weekStart={rangeStart}
        weekEnd={rangeEnd}
        summary={
          summary
            ? {
                cashClosingBalance: summary.cashClosingBalance,
                bankClosingBalance: summary.bankClosingBalance,
                remesaDebtTotal: summary.remesaDebtTotal,
              }
            : null
        }
        onSave={(p) =>
          createCut.mutate(p, {
            onSuccess: () => setShowCut(false),
            onError: handleActionError,
          })
        }
        isSaving={createCut.isPending}
      />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Datepicker,
  Dropdown,
  DropdownItem,
  Spinner,
} from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import {
  HiAdjustments,
  HiArrowSmDown,
  HiCalendar,
  HiCash,
  HiCog,
  HiCreditCard,
  HiQuestionMarkCircle,
  HiReceiptRefund,
} from "react-icons/hi";
import { formatDateRange, toLocalDateString } from "@/utils/date.utils";
import { extractErrorMessage } from "@/features/accounting/utils/errorMessage";
import AccountingErrorAlert from "@/features/accounting/components/AccountingErrorAlert";
import { AccountingToast } from "@/features/accounting/components/AccountingToast";
import { useClients } from "@/core/client/api/client.queries";
import {
  useAvailableExpenses,
  useCashFlowCuts,
  useCashFlowMovements,
  useCashFlowSettings,
  useCashFlowSummary,
  useCollectionSuggestions,
  useConfirmTripSettlements,
  useCreateCashFlowAdjustment,
  useCreateCashFlowCut,
  useCreateCashFlowDeposit,
  useCreateCashFlowExpense,
  useCreateCashFlowIncome,
  useCreateCashFlowRemesaPayment,
  useCreateCashFlowSettings,
  useDeleteCashFlowCut,
  useDeleteCashFlowMovement,
  useMoveCashFlowMovement,
  useRemesas,
  useTripSettlements,
  useUpdateCashFlowSettings,
} from "../api/eggCashFlow.queries";
import CashFlowBalanceCards from "../components/CashFlowBalanceCards";
import CashFlowMovementsTable from "../components/CashFlowMovementsTable";
import WeeklySummaryCard from "../components/WeeklySummaryCard";
import PendingCollectionsPanel from "../components/PendingCollectionsPanel";
import TripSettlementsPanel from "../components/TripSettlementsPanel";
import RemesasPanel from "../components/RemesasPanel";
import CutsPanel from "../components/CutsPanel";
import IncomeModal from "../components/IncomeModal";
import DepositModal from "../components/DepositModal";
import CashExpenseModal from "../components/CashExpenseModal";
import RemesaPaymentModal from "../components/RemesaPaymentModal";
import AdjustmentModal from "../components/AdjustmentModal";
import CutModal from "../components/CutModal";
import SettingsModal from "../components/SettingsModal";
import {
  accountLabel,
  currentWeekRange,
  formatDate,
  previousWeekRange,
} from "../utils/cashFlow.utils";
import type {
  ConfirmTripSettlementItemDTO,
  EggCashFlowUnit,
} from "../types/eggCashFlow.types";

interface Props {
  unitType: EggCashFlowUnit;
}

export default function EggCashFlowPage({ unitType }: Props) {
  const { slug } = useParams();
  const previousWeek = useMemo(() => previousWeekRange(), []);

  const [rangeStart, setRangeStart] = useState<Date>(previousWeek.start);
  const [rangeEnd, setRangeEnd] = useState<Date>(previousWeek.end);
  const [accountFilter, setAccountFilter] = useState<"ALL" | "CASH" | "BANK">(
    "ALL",
  );
  const [collectionView, setCollectionView] = useState<"ALL" | "CREDIT">("ALL");

  const [showSettings, setShowSettings] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showCashExpense, setShowCashExpense] = useState(false);
  const [showRemesaPayment, setShowRemesaPayment] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showCut, setShowCut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [settlementError, setSettlementError] = useState<{
    message: string;
    tripId?: number;
  } | null>(null);
  const [settlementToast, setSettlementToast] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incomePrefill, setIncomePrefill] = useState<{
    paymentId?: number | null;
  } | null>(null);
  const [remesaPrefill, setRemesaPrefill] = useState<number | null>(null);
  const [rangeTouched, setRangeTouched] = useState(false);
  const defaultRangeApplied = useRef(false);

  const from = toLocalDateString(rangeStart);
  const to = toLocalDateString(rangeEnd);

  const settingsQuery = useCashFlowSettings(unitType);
  const summaryQuery = useCashFlowSummary(unitType, from, to);
  const movementsQuery = useCashFlowMovements(unitType, from, to);
  const settlementsQuery = useTripSettlements(unitType, from, to);
  const collectionsQuery = useCollectionSuggestions(unitType, from, to);
  const remesasQuery = useRemesas(unitType);
  const cutsQuery = useCashFlowCuts(unitType);
  const expensesQuery = useAvailableExpenses(unitType, from, to);
  const clientsQuery = useClients();

  const createSettings = useCreateCashFlowSettings(unitType);
  const updateSettings = useUpdateCashFlowSettings(unitType);
  const createIncome = useCreateCashFlowIncome(unitType);
  const confirmSettlements = useConfirmTripSettlements(unitType);
  const createDeposit = useCreateCashFlowDeposit(unitType);
  const createExpense = useCreateCashFlowExpense(unitType);
  const createRemesaPayment = useCreateCashFlowRemesaPayment(unitType);
  const createAdjustment = useCreateCashFlowAdjustment(unitType);
  const createCut = useCreateCashFlowCut(unitType);
  const deleteMovement = useDeleteCashFlowMovement(unitType);
  const moveMovement = useMoveCashFlowMovement(unitType);
  const deleteCut = useDeleteCashFlowCut(unitType);

  const settings = settingsQuery.data ?? null;
  const summary = summaryQuery.data;
  const accountHolder = settings?.accountHolder ?? "Titular";
  const cuts = useMemo(() => cutsQuery.data ?? [], [cutsQuery.data]);

  useEffect(() => {
    if (defaultRangeApplied.current || rangeTouched || cuts.length === 0) {
      return;
    }
    defaultRangeApplied.current = true;
    const latest = cuts[0];
    setRangeStart(new Date(`${latest.weekStart}T00:00:00`));
    setRangeEnd(new Date(`${latest.weekEnd}T00:00:00`));
  }, [cuts, rangeTouched]);

  const handleRangeStart = (date: Date) => {
    setRangeStart(date);
    setRangeTouched(true);
  };

  const handleRangeEnd = (date: Date) => {
    setRangeEnd(date);
    setRangeTouched(true);
  };

  const handleShowCutPeriod = () => {
    if (cuts.length === 0) return;
    const earliest = cuts[cuts.length - 1];
    const latest = cuts[0];
    setRangeStart(new Date(`${earliest.weekStart}T00:00:00`));
    setRangeEnd(new Date(`${latest.weekEnd}T00:00:00`));
    setRangeTouched(true);
  };

  const handleToday = () => {
    const today = new Date();
    setRangeStart(today);
    setRangeEnd(today);
    setRangeTouched(true);
  };

  const handleCurrentWeek = () => {
    const range = currentWeekRange();
    setRangeStart(range.start);
    setRangeEnd(range.end);
    setRangeTouched(true);
  };

  const handlePreviousWeek = () => {
    const range = previousWeekRange();
    setRangeStart(range.start);
    setRangeEnd(range.end);
    setRangeTouched(true);
  };

  const handleActionError = (error: unknown) =>
    setActionError(extractErrorMessage(error));

  const handleDelete = (id: number) => {
    deleteMovement.mutate(id, {
      onSuccess: () => setToastMessage("Movimiento eliminado."),
      onError: handleActionError,
    });
  };

  const handleMove = (id: number, account: "CASH" | "BANK") => {
    moveMovement.mutate(
      { id, payload: { account } },
      {
        onSuccess: () => setToastMessage("Movimiento movido de bolsa."),
        onError: handleActionError,
      },
    );
  };

  const handleConfirmSettlements = (items: ConfirmTripSettlementItemDTO[]) => {
    setSettlementError(null);
    setSettlementToast(null);
    confirmSettlements.mutate(
      { items },
      {
        onSuccess: (settlements) => {
          setSettlementError(null);
          setSettlementToast(null);
          setToastMessage(
            settlements.length === 1
              ? "Cobranza de ruta confirmada."
              : `${settlements.length} cobranzas de ruta confirmadas.`,
          );
        },
        onError: (error) => {
          const tripId = items.length === 1 ? items[0].tripId : undefined;
          const trip =
            tripId == null
              ? null
              : settlementsQuery.data?.find(
                  (settlement) => settlement.tripId === tripId,
                );
          const tripLabel = trip
            ? `${formatDate(trip.departureDate)} · ${
                trip.driverName ?? "Sin chofer"
              }`
            : undefined;
          const message = extractErrorMessage(error);
          setToastMessage(null);
          setSettlementError({ message, tripId });
          setSettlementToast(`${tripLabel ? `${tripLabel}: ` : ""}${message}`);
        },
      },
    );
  };

  const helpLink = (
    <Button
      as={Link}
      to={`/business/${slug}/cash-flow/help`}
      color="light"
      size="sm"
    >
      <HiQuestionMarkCircle className="mr-2 h-4 w-4" />
      Ayuda
    </Button>
  );

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
        <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Flujo de efectivo
            </h1>
            <p className="text-sm text-slate-400">
              Control de efectivo y cuenta bancaria del negocio de huevo.
            </p>
          </div>
          {helpLink}
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
        <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Flujo de efectivo
            </h1>
            <p className="text-sm text-slate-400">
              Control de efectivo y cuenta bancaria del negocio de huevo.
            </p>
          </div>
          {helpLink}
        </header>
        <div className="rounded-xl bg-slate-800 p-10 text-center">
          <h2 className="text-lg font-semibold text-white">
            Configura tu flujo de efectivo
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Define los saldos iniciales de efectivo en oficina y de la cuenta
            del titular, y el nombre de la cuenta, para empezar a registrar
            ingresos, depósitos y gastos.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={() => setShowSettings(true)}>
              <HiCog className="mr-2 h-4 w-4" />
              Configurar
            </Button>
            <Button
              as={Link}
              to={`/business/${slug}/cash-flow/help`}
              color="light"
            >
              Ver ayuda
            </Button>
          </div>
        </div>
        <SettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          clients={clientsQuery.data ?? []}
          onSave={(p) =>
            createSettings.mutate(p, {
              onSuccess: () => {
                setShowSettings(false);
                setToastMessage("Flujo de efectivo configurado.");
              },
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
      <AccountingToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
      <AccountingToast
        message={settlementToast}
        onDismiss={() => setSettlementToast(null)}
        variant="failure"
        title="No se pudo confirmar la cobranza"
        autoDismissMs={8000}
      />

      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Flujo de efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Dónde está el efectivo físico: en oficina y en{" "}
            {accountLabel(accountHolder)}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setIncomePrefill(null);
              setShowIncome(true);
            }}
          >
            <HiCash className="mr-1 h-4 w-4" />
            Registrar cobranza
          </Button>
          <Button color="light" size="sm" onClick={() => setShowDeposit(true)}>
            <HiArrowSmDown className="mr-1 h-4 w-4" />
            Depósito
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => setShowCashExpense(true)}
          >
            <HiReceiptRefund className="mr-1 h-4 w-4" />
            Gasto en efectivo
          </Button>
          <Button
            color="light"
            size="sm"
            onClick={() => {
              setRemesaPrefill(null);
              setShowRemesaPayment(true);
            }}
          >
            <HiCreditCard className="mr-1 h-4 w-4" />
            Pagar remesa
          </Button>
          <Dropdown label="Más acciones" color="light" size="sm" dismissOnClick>
            <DropdownItem
              icon={HiAdjustments}
              onClick={() => setShowAdjustment(true)}
            >
              Ajuste
            </DropdownItem>
            <DropdownItem icon={HiCog} onClick={() => setShowSettings(true)}>
              Configurar
            </DropdownItem>
          </Dropdown>
          {helpLink}
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
            onChange={(d) => d && handleRangeStart(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Hasta
          </label>
          <Datepicker
            language="es-MX"
            value={rangeEnd}
            onChange={(d) => d && handleRangeEnd(d)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button color="light" size="xs" onClick={handleToday}>
            Hoy
          </Button>
          <Button color="light" size="xs" onClick={handleCurrentWeek}>
            Esta semana
          </Button>
          <Button color="light" size="xs" onClick={handlePreviousWeek}>
            Semana anterior
          </Button>
          {cuts.length > 0 && (
            <Button color="light" size="xs" onClick={handleShowCutPeriod}>
              <HiCalendar className="mr-1 h-3 w-3" />
              Ver periodo de cortes
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Cobranza</h2>
          <p className="text-sm text-slate-400">
            Confirma el efectivo de ruta y registra los cobros a crédito
            pendientes.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filtrar cobranza por tipo"
        >
          {(
            [
              ["ALL", "Todo"],
              ["CREDIT", "Solo crédito"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="xs"
              color={collectionView === value ? "blue" : "gray"}
              onClick={() => setCollectionView(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {settlementsQuery.isError || collectionsQuery.isError ? (
        <AccountingErrorAlert
          error={settlementsQuery.error ?? collectionsQuery.error}
          title="No se pudo cargar el estado de cobranza"
          onRetry={() => {
            if (settlementsQuery.isError) settlementsQuery.refetch();
            if (collectionsQuery.isError) collectionsQuery.refetch();
          }}
        />
      ) : (
        <>
          {collectionView === "ALL" &&
            (settlementsQuery.isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="lg" />
              </div>
            ) : (
              <TripSettlementsPanel
                key={`${from}-${to}`}
                settlements={settlementsQuery.data ?? []}
                onConfirm={handleConfirmSettlements}
                isConfirming={confirmSettlements.isPending}
                accountHolder={accountHolder}
                error={settlementError}
                onDismissError={() => setSettlementError(null)}
              />
            ))}
          {collectionsQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="lg" />
            </div>
          ) : (
            <PendingCollectionsPanel
              key={`credit-${from}-${to}`}
              collections={collectionsQuery.data ?? []}
              onCollectPayment={(c) => {
                setIncomePrefill({ paymentId: c.paymentId });
                setShowIncome(true);
              }}
            />
          )}
        </>
      )}

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

      {remesasQuery.isError ? (
        <AccountingErrorAlert
          error={remesasQuery.error}
          title="No se pudieron cargar las remesas"
          onRetry={() => remesasQuery.refetch()}
        />
      ) : (
        <RemesasPanel
          remesas={remesasQuery.data ?? []}
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
          onMove={handleMove}
          accountFilter={accountFilter}
          onAccountFilterChange={setAccountFilter}
          collectionView={collectionView}
          isDeleting={deleteMovement.isPending}
        />
      )}

      {cutsQuery.isError ? (
        <AccountingErrorAlert
          error={cutsQuery.error}
          title="No se pudieron cargar los cortes"
          onRetry={() => cutsQuery.refetch()}
        />
      ) : (
        <CutsPanel
          cuts={cuts}
          onReopen={(id) =>
            deleteCut.mutate(id, {
              onSuccess: () => setToastMessage("Corte reabierto."),
              onError: handleActionError,
            })
          }
          onCreateCut={() => setShowCut(true)}
        />
      )}

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        clients={clientsQuery.data ?? []}
        onSave={(p) =>
          updateSettings.mutate(p, {
            onSuccess: () => {
              setShowSettings(false);
              setToastMessage("Configuración actualizada.");
            },
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
        collections={collectionsQuery.data ?? []}
        initialPaymentId={incomePrefill?.paymentId ?? null}
        onSave={(p) =>
          createIncome.mutate(p, {
            onSuccess: () => {
              setShowIncome(false);
              setIncomePrefill(null);
              setToastMessage("Ingreso registrado.");
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
            onSuccess: () => {
              setShowDeposit(false);
              setToastMessage("Depósito registrado.");
            },
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
            onSuccess: () => {
              setShowCashExpense(false);
              setToastMessage("Gasto en efectivo registrado.");
            },
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
              setToastMessage("Pago de remesa registrado.");
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
            onSuccess: () => {
              setShowAdjustment(false);
              setToastMessage("Ajuste registrado.");
            },
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
            onSuccess: () => {
              setShowCut(false);
              setToastMessage("Semana cerrada.");
            },
            onError: handleActionError,
          })
        }
        isSaving={createCut.isPending}
      />
    </div>
  );
}

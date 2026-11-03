import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { useClients } from "@/core/client/api/client.queries";
import type { Client } from "@/core/api/types";
import { BatchPreviewDrawer } from "@/features/batch/components/BatchPreviewDrawer";
import { useOpenAccounts } from "../../api/accounts-payable.queries";
import {
  useApplyCreditsToAccount,
  useCreateFifoPayment,
  useSameDayPayments,
  useUnappliedPayments,
} from "../../api/payments.queries";
import type { PaymentMethod } from "../../types/payment.types";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate, toLocalDateString } from "@/utils/date.utils";
import { extractErrorMessage } from "../../utils/errorMessage";
import {
  isDuplicatePayment,
  previewClientCollection,
  summarizeClientDebts,
} from "../../utils/clientCollections";
import {
  useCashFlowSettings,
  useCollectionAvailability,
} from "@/features/egg-cash-flow/api/eggCashFlow.queries";
import { AccountingErrorAlert } from "../AccountingErrorAlert";
import { AgingBadge } from "../AgingBadge";
import { SourceBadge } from "../SourceBadge";
import { ClientAutocomplete } from "./ClientAutocomplete";
import { newClientRequestId } from "../../utils/requestId";
import { openPaymentReceipt } from "../../utils/paymentReceipt";

interface Props {
  onSuccessToast?: (message: string) => void;
}

interface CollectionResult {
  paymentId: number;
  clientName: string;
  cedisName: string;
  dateLabel: string;
  amount: number;
  appliedAmount: number;
  parkedAmount: number;
  duplicate: boolean;
  methodLabel: string;
  folio: string | null;
  collectorId: number | null;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia",
  DEPOSIT: "Depósito",
  CHECK: "Cheque",
  OTHER: "Otro",
};

export const ClientCollectionPanel = ({ onSuccessToast }: Props) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCedisId, setSelectedCedisId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [folio, setFolio] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CollectionResult | null>(null);
  const [showDebts, setShowDebts] = useState(false);
  const [previewDebt, setPreviewDebt] = useState<{
    batchId: number;
    saleId: number | null;
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const createPayment = useCreateFifoPayment();
  const applyCredits = useApplyCreditsToAccount();

  const { data: clients = [] } = useClients();
  const {
    data: debts = [],
    isLoading: debtsLoading,
    isError: debtsError,
    error: debtsErrorDetail,
    refetch,
  } = useOpenAccounts(
    {
      debtorId: selectedClient?.accountingEntityId,
      creditorEntityType: "EGGCEDIS",
      status: "OPEN",
    },
    !!selectedClient,
  );

  const summary = useMemo(() => summarizeClientDebts(debts), [debts]);
  const selectedCedis =
    summary.cedis.find((cedis) => cedis.creditorId === selectedCedisId) ?? null;
  const isoDate = toLocalDateString(paymentDate);
  const amountValue = Number(amount);
  const validAmount = Number.isFinite(amountValue) && amountValue > 0;
  const preview = selectedCedis
    ? previewClientCollection(selectedCedis.balance, amountValue)
    : { appliedAmount: 0, parkedAmount: 0 };

  const {
    data: pairPayments = [],
    isError: pairError,
    isLoading: pairLoading,
    refetch: refetchPair,
  } = useSameDayPayments(selectedClient?.accountingEntityId, isoDate);

  const duplicate =
    validAmount && isDuplicatePayment(pairPayments, amountValue, isoDate);
  const {
    data: availability,
    isError: availabilityError,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useCollectionAvailability("EGG", isoDate);
  const verificationPending = pairLoading || availabilityLoading;
  const verificationError = pairError || availabilityError;
  const { data: credits = [], refetch: refetchCredits } = useUnappliedPayments(
    selectedClient?.accountingEntityId,
  );
  const { data: cashFlowSettings } = useCashFlowSettings("EGG");
  const creditAvailable = credits.reduce(
    (sum, payment) => sum + Number(payment.remainingAmount ?? 0),
    0,
  );
  const directDeposit =
    selectedClient != null &&
    (cashFlowSettings?.directDepositClientIds ?? []).includes(
      selectedClient.id,
    );
  const methodConflict =
    selectedClient != null &&
    (directDeposit ? paymentMethod === "CASH" : paymentMethod !== "CASH");
  const requiresFolio = paymentMethod !== "CASH";
  const validFolio = !requiresFolio || folio.trim().length > 0;
  const oldestSelectedDebt = useMemo(
    () =>
      debts
        .filter(
          (debt) =>
            debt.creditorId === selectedCedisId && Number(debt.balance) > 0,
        )
        .sort((left, right) => left.date.localeCompare(right.date))[0] ?? null,
    [debts, selectedCedisId],
  );

  useEffect(() => {
    if (!selectedClient) {
      setSelectedCedisId(null);
      setAmount("");
      return;
    }
    if (debtsLoading) return;
    if (summary.cedis.length === 0) {
      setSelectedCedisId(null);
      setAmount("");
      return;
    }
    const currentIsValid = summary.cedis.some(
      (cedis) => cedis.creditorId === selectedCedisId,
    );
    if (!currentIsValid) {
      const largest = summary.cedis[0];
      setSelectedCedisId(largest.creditorId);
      setAmount(String(largest.balance));
    }
  }, [selectedClient, debtsLoading, summary, selectedCedisId]);

  const handleClientSelect = (client: Client | null) => {
    requestIdRef.current = null;
    setSelectedClient(client);
    setSelectedCedisId(null);
    setAmount("");
    setPaymentMethod("CASH");
    setPaymentDate(new Date());
    setFolio("");
    setNote("");
    setError(null);
    setLastResult(null);
    setShowDebts(false);
    setPreviewDebt(null);
  };

  const handleCedisChange = (value: string) => {
    requestIdRef.current = null;
    const nextId = Number(value);
    const nextCedis = summary.cedis.find(
      (cedis) => cedis.creditorId === nextId,
    );
    setSelectedCedisId(nextId);
    setAmount(nextCedis ? String(nextCedis.balance) : "");
    setLastResult(null);
  };

  const handleApplyCredit = () => {
    if (!oldestSelectedDebt) return;
    setError(null);
    applyCredits.mutate(oldestSelectedDebt.id, {
      onSuccess: (result) => {
        onSuccessToast?.(
          `Saldo a favor aplicado: ${formatMXN(result.data.totalApplied)}`,
        );
        refetch();
        refetchCredits();
      },
      onError: (mutationError) => setError(extractErrorMessage(mutationError)),
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !selectedClient?.accountingEntityId ||
      !selectedCedis ||
      !validAmount ||
      !validFolio ||
      verificationError ||
      verificationPending
    ) {
      return;
    }

    setError(null);
    setLastResult(null);
    const clientRequestId = requestIdRef.current ?? newClientRequestId();
    requestIdRef.current = clientRequestId;
    createPayment.mutate(
      {
        payerId: selectedClient.accountingEntityId,
        receiverId: selectedCedis.creditorId,
        amount: amountValue,
        paymentDate: isoDate,
        paymentMethod,
        clientRequestId,
        folio: folio.trim() || undefined,
        note:
          note.trim() ||
          `Cobranza cliente ${selectedClient.name ?? selectedClient.businessName ?? ""}`.trim(),
      },
      {
        onSuccess: (payment) => {
          const appliedAmount = payment.appliedAmount ?? preview.appliedAmount;
          const parkedAmount = payment.remainingAmount ?? preview.parkedAmount;
          const message = `Cobro registrado · aplicado ${formatMXN(appliedAmount)} · saldo a favor ${formatMXN(parkedAmount)}`;
          onSuccessToast?.(message);
          setLastResult({
            paymentId: payment.id,
            clientName:
              selectedClient.name ?? selectedClient.businessName ?? "Cliente",
            cedisName: selectedCedis.creditorName,
            dateLabel: formatHumanDate(isoDate, "long"),
            amount: amountValue,
            appliedAmount,
            parkedAmount,
            duplicate,
            methodLabel: METHOD_LABELS[paymentMethod],
            folio: folio.trim() || null,
            collectorId: payment.createdBy ?? null,
          });
          requestIdRef.current = null;
          setSelectedClient(null);
          setSelectedCedisId(null);
          setAmount("");
          setPaymentMethod("CASH");
          setPaymentDate(new Date());
          setFolio("");
          setNote("");
          setShowDebts(false);
          setPreviewDebt(null);
          setResetKey((key) => key + 1);
          window.setTimeout(() => searchRef.current?.focus(), 0);
        },
        onError: (mutationError) => {
          setError(extractErrorMessage(mutationError));
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
        <Label htmlFor="collection-client">Cliente</Label>
        <div className="mt-1">
          <ClientAutocomplete
            clients={clients}
            selected={selectedClient}
            onSelect={handleClientSelect}
            inputRef={searchRef}
            resetKey={resetKey}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Solo aparecen clientes con cuenta por cobrar.
        </p>
      </div>

      {error && (
        <Alert color="failure">
          <span className="font-medium">No se pudo registrar el cobro.</span>{" "}
          {error}
        </Alert>
      )}

      {lastResult && (
        <Alert color="success">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              Cobro registrado · aplicado {formatMXN(lastResult.appliedAmount)}{" "}
              · saldo a favor {formatMXN(lastResult.parkedAmount)}
            </span>
            <Button
              size="xs"
              color="gray"
              onClick={() =>
                openPaymentReceipt({
                  paymentId: lastResult.paymentId,
                  clientName: lastResult.clientName,
                  cedisName: lastResult.cedisName,
                  dateLabel: lastResult.dateLabel,
                  amount: lastResult.amount,
                  appliedAmount: lastResult.appliedAmount,
                  parkedAmount: lastResult.parkedAmount,
                  methodLabel: lastResult.methodLabel,
                  folio: lastResult.folio,
                  collectorId: lastResult.collectorId,
                })
              }
            >
              Imprimir recibo
            </Button>
          </div>
          {lastResult.duplicate && (
            <p className="mt-1 text-xs">
              También había un cobro con el mismo monto ese día para este
              cliente.
            </p>
          )}
        </Alert>
      )}

      {pairError && (
        <Alert color="failure">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              No se pudo verificar si ya existe un cobro el mismo día. No se
              puede guardar hasta confirmarlo.
            </span>
            <Button size="xs" color="gray" onClick={() => refetchPair()}>
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {availabilityError && (
        <Alert color="failure">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              No se pudo verificar el Flujo de efectivo. No se puede guardar
              hasta confirmarlo.
            </span>
            <Button
              size="xs"
              color="gray"
              onClick={() => refetchAvailability()}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {availability && !availability.writable && availability.message && (
        <Alert color="warning">{availability.message}</Alert>
      )}

      {selectedClient && debtsLoading && (
        <div className="flex justify-center rounded-lg border border-gray-800 bg-gray-900/40 py-10">
          <Spinner size="md" />
        </div>
      )}

      {selectedClient && debtsError && (
        <AccountingErrorAlert
          error={debtsErrorDetail}
          title="No se pudo cargar la deuda del cliente"
          onRetry={() => refetch()}
        />
      )}

      {selectedClient &&
        !debtsLoading &&
        !debtsError &&
        summary.cedis.length === 0 && (
          <Alert color="info">Este cliente no tiene deuda abierta.</Alert>
        )}

      {selectedClient &&
        !debtsLoading &&
        !debtsError &&
        summary.cedis.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs tracking-wider text-gray-400 uppercase">
                  Deuda total
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {formatMXN(summary.totalDebt)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs tracking-wider text-gray-400 uppercase">
                  Deuda más antigua
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {summary.oldestDebtDate
                      ? formatHumanDate(summary.oldestDebtDate, "short")
                      : "—"}
                  </span>
                  {summary.oldestDebtDate && (
                    <AgingBadge isoDate={summary.oldestDebtDate} />
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs tracking-wider text-gray-400 uppercase">
                  Deudas abiertas
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {summary.debtCount}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs tracking-wider text-gray-400 uppercase">
                  Saldo a favor
                </p>
                <p className="mt-1 text-lg font-semibold text-amber-300">
                  {formatMXN(creditAvailable)}
                </p>
                {creditAvailable > 0 && (
                  <Button
                    size="xs"
                    color="gray"
                    className="mt-2"
                    disabled={!oldestSelectedDebt || applyCredits.isPending}
                    onClick={handleApplyCredit}
                  >
                    {applyCredits.isPending
                      ? "Aplicando..."
                      : "Aplicar a deuda más antigua"}
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/50">
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
                aria-expanded={showDebts}
                onClick={() => setShowDebts((value) => !value)}
              >
                <span className="text-sm font-medium text-white">
                  Deudas abiertas del cliente ({summary.debtCount})
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                  {showDebts ? "Ocultar" : "Ver deudas"}
                  {showDebts ? (
                    <HiChevronUp className="h-3 w-3" />
                  ) : (
                    <HiChevronDown className="h-3 w-3" />
                  )}
                </span>
              </button>
              {showDebts && (
                <div className="max-h-80 divide-y divide-gray-800 overflow-y-auto border-t border-gray-800">
                  {debts.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {debt.creditorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatHumanDate(debt.date, "short")} · Total{" "}
                          {formatMXN(debt.totalAmount)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">
                          {formatMXN(debt.balance)}
                        </span>
                        {debt.sourceType ? (
                          <SourceBadge
                            sourceType={debt.sourceType}
                            sourceBatchId={debt.sourceBatchId}
                            sourceId={debt.sourceId}
                            onOpenSource={(batchId, saleId) =>
                              setPreviewDebt({
                                batchId,
                                saleId: saleId ?? null,
                              })
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-500">
                            Sin documento
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4"
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <Label htmlFor="collection-cedis">CEDIS</Label>
                  {summary.cedis.length > 1 ? (
                    <Select
                      id="collection-cedis"
                      value={selectedCedisId ?? ""}
                      onChange={(event) =>
                        handleCedisChange(event.target.value)
                      }
                    >
                      {summary.cedis.map((cedis) => (
                        <option key={cedis.creditorId} value={cedis.creditorId}>
                          {cedis.creditorName} · {formatMXN(cedis.balance)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <p className="mt-2 text-sm text-white">
                      {summary.cedis[0].creditorName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="collection-amount">Monto</Label>
                  <TextInput
                    id="collection-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      requestIdRef.current = null;
                      setAmount(event.target.value);
                      setLastResult(null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="collection-date">Fecha</Label>
                  <Datepicker
                    id="collection-date"
                    language="es-MX"
                    maxDate={new Date()}
                    value={paymentDate}
                    onChange={(value) => {
                      if (value) {
                        requestIdRef.current = null;
                        setPaymentDate(value);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <Label htmlFor="collection-method">Método de pago</Label>
                  <Select
                    id="collection-method"
                    value={paymentMethod}
                    onChange={(event) => {
                      requestIdRef.current = null;
                      setPaymentMethod(event.target.value as PaymentMethod);
                    }}
                  >
                    {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map(
                      (method) => (
                        <option key={method} value={method}>
                          {METHOD_LABELS[method]}
                        </option>
                      ),
                    )}
                  </Select>
                </div>
                <div className="flex items-end lg:col-span-2">
                  <p className="text-sm text-gray-300">
                    Se aplicará{" "}
                    <strong className="text-white">
                      {formatMXN(preview.appliedAmount)}
                    </strong>{" "}
                    · saldo a favor{" "}
                    <strong className="text-amber-300">
                      {formatMXN(preview.parkedAmount)}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label htmlFor="collection-folio">
                    Referencia{requiresFolio ? " *" : " (opcional)"}
                  </Label>
                  <TextInput
                    id="collection-folio"
                    value={folio}
                    placeholder="Folio, transferencia o cheque"
                    onChange={(event) => {
                      requestIdRef.current = null;
                      setFolio(event.target.value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="collection-note">Nota (opcional)</Label>
                  <TextInput
                    id="collection-note"
                    value={note}
                    placeholder="Observaciones del cobro"
                    onChange={(event) => {
                      requestIdRef.current = null;
                      setNote(event.target.value);
                    }}
                  />
                </div>
              </div>

              {requiresFolio && !validFolio && (
                <p className="text-xs text-red-400">
                  Captura la referencia para pagos que no son en efectivo.
                </p>
              )}

              {methodConflict && (
                <Alert color="warning">
                  {directDeposit
                    ? "Este cliente está configurado para depósito directo. Si registras efectivo, el movimiento se reflejará en caja."
                    : "Este cliente no está configurado para depósito directo. Si registras un pago bancario, el movimiento se reflejará en banco."}
                </Alert>
              )}

              {duplicate && (
                <Alert color="warning">
                  Ya existe un cobro de {formatMXN(amountValue)} el mismo día
                  para este cliente. Revisa antes de guardar; puedes continuar
                  si es correcto.
                </Alert>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  El pago se aplica a las deudas más antiguas de este CEDIS.
                </p>
                <Button
                  type="submit"
                  disabled={
                    !validAmount ||
                    !validFolio ||
                    createPayment.isPending ||
                    verificationError ||
                    verificationPending
                  }
                >
                  {createPayment.isPending
                    ? "Registrando..."
                    : "Registrar cobro"}
                </Button>
              </div>
            </form>
          </>
        )}

      {!selectedClient && (
        <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/30 p-8 text-center">
          <p className="text-sm text-gray-400">
            Busca un cliente para ver su saldo y registrar el cobro.
          </p>
        </div>
      )}

      <BatchPreviewDrawer
        open={previewDebt != null}
        onClose={() => setPreviewDebt(null)}
        batchId={previewDebt?.batchId ?? null}
        highlightSaleId={previewDebt?.saleId ?? null}
        highlightLabel="Venta que generó esta deuda"
        unitType="EGG"
      />
    </div>
  );
};

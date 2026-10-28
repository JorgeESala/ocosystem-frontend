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
import { useClients } from "@/core/client/api/client.queries";
import type { Client } from "@/core/api/types";
import { useOpenAccounts } from "../../api/accounts-payable.queries";
import {
  useCreateFifoPayment,
  useSameDayPayments,
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
import { useCollectionAvailability } from "@/features/egg-cash-flow/api/eggCashFlow.queries";
import { AccountingErrorAlert } from "../AccountingErrorAlert";
import { AgingBadge } from "../AgingBadge";
import { ClientAutocomplete } from "./ClientAutocomplete";

interface Props {
  onSuccessToast?: (message: string) => void;
}

interface CollectionResult {
  appliedAmount: number;
  parkedAmount: number;
  duplicate: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CollectionResult | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const createPayment = useCreateFifoPayment();

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

  const { data: pairPayments = [] } = useSameDayPayments(
    selectedClient?.accountingEntityId,
    isoDate,
  );

  const duplicate =
    validAmount && isDuplicatePayment(pairPayments, amountValue, isoDate);
  const { data: availability } = useCollectionAvailability("EGG", isoDate);

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
      setAmount(String(summary.totalDebt));
    }
  }, [selectedClient, debtsLoading, summary, selectedCedisId]);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setSelectedCedisId(null);
    setAmount("");
    setPaymentMethod("CASH");
    setPaymentDate(new Date());
    setError(null);
    setLastResult(null);
  };

  const handleCedisChange = (value: string) => {
    setSelectedCedisId(Number(value));
    setLastResult(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClient?.accountingEntityId || !selectedCedis || !validAmount) {
      return;
    }

    setError(null);
    setLastResult(null);
    createPayment.mutate(
      {
        payerId: selectedClient.accountingEntityId,
        receiverId: selectedCedis.creditorId,
        amount: amountValue,
        paymentDate: isoDate,
        paymentMethod,
        note: `Cobranza cliente ${selectedClient.name ?? selectedClient.businessName ?? ""}`.trim(),
      },
      {
        onSuccess: (payment) => {
          const appliedAmount = payment.appliedAmount ?? preview.appliedAmount;
          const parkedAmount = payment.remainingAmount ?? preview.parkedAmount;
          const message = `Cobro registrado · aplicado ${formatMXN(appliedAmount)} · saldo a favor ${formatMXN(parkedAmount)}`;
          onSuccessToast?.(message);
          setLastResult({ appliedAmount, parkedAmount, duplicate });
          setSelectedClient(null);
          setSelectedCedisId(null);
          setAmount("");
          setPaymentMethod("CASH");
          setPaymentDate(new Date());
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
          <span className="font-medium">
            Cobro registrado · aplicado {formatMXN(lastResult.appliedAmount)} ·
            saldo a favor {formatMXN(lastResult.parkedAmount)}
          </span>
          {lastResult.duplicate && (
            <p className="mt-1 text-xs">
              También había un cobro con el mismo monto ese día para este
              cliente.
            </p>
          )}
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
            <div className="grid gap-3 sm:grid-cols-3">
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
                    value={paymentDate}
                    onChange={(value) => {
                      if (value) setPaymentDate(value);
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
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as PaymentMethod)
                    }
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
                  disabled={!validAmount || createPayment.isPending}
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
    </div>
  );
};

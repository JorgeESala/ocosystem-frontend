import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Select,
  Textarea,
  Datepicker,
} from "flowbite-react";
import { useState, useEffect } from "react";
import type { AccountsPayableResponse } from "../../live-chicken/accounting/accounts-payable/types";

import type { PaymentMethod } from "../types/payment.types";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useRoutes } from "@/core/api/route/routes.queries";
import { useOpenAccounts } from "../api/accounts-payable.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import {
  useCreateCompensationPaymentFromAP,
  useCreatePayment,
} from "@/features/accounting/api/payments.queries";
import { AccountingErrorAlert } from "./AccountingErrorAlert";

const CONFIRMATION_THRESHOLD = 10_000;

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
  cedisList?: number[] | undefined;
  creditorEntity?: string | undefined;
  allowCompensation?: boolean;
  onSuccessToast?: (message: string) => void;
}

type PaymentKind = "NORMAL" | "COMPENSATION";

type NormalPayload = {
  kind: "NORMAL";
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  folio: string;
  note: string;
  driverId: number | undefined;
  routeId: number | undefined;
};

type CompensationPayload = {
  kind: "COMPENSATION";
  amount: number;
  paymentDate: Date;
  folio: string;
  note: string;
  cedisSupplierAccountsPayableId: number;
  selectedPayable: AccountsPayableResponse;
};

type PendingConfirmation = {
  payload: NormalPayload | CompensationPayload;
  branchCedisAccount: AccountsPayableResponse;
};

export const RegisterPaymentModal = ({
  open,
  onClose,
  account,
  cedisList,
  creditorEntity,
  allowCompensation = true,
  onSuccessToast,
}: Props) => {
  const createPayment = useCreatePayment();
  const createCompensationPayment = useCreateCompensationPaymentFromAP();

  const { data: drivers } = useDrivers();
  const { data: routes } = useRoutes();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [note, setnote] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [paymentKind, setPaymentKind] = useState<PaymentKind>("NORMAL");
  const [selectedAPId, setSelectedAPId] = useState("");
  const [compensationError, setCompensationError] = useState<string | null>(
    null,
  );
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const { data: payableAccounts = [] } = useOpenAccounts({
    debtorOriginalIds: cedisList,
    debtorEntityType: creditorEntity,
  });

  const validPayables = payableAccounts.filter((ap) => ap.balance > 0);
  const selectedPayable = validPayables.find(
    (ap) => String(ap.id) === selectedAPId,
  );
  const maxCompensationAmount = Math.min(
    account?.balance ?? Infinity,
    selectedPayable?.balance ?? Infinity,
  );

  useEffect(() => {
    if (open && account) {
      setPaymentKind("NORMAL");
      setPaymentDate(new Date());
      setFolio("");
      setnote("");
      setPaymentMethod("DEPOSIT");
      setAmount("");
      setDriverId("");
      setRouteId("");
      setSelectedAPId("");
      setCompensationError(null);
      setPendingConfirmation(null);
    }
  }, [open, account]);

  if (!account) return null;

  const handleSelectedPayableChange = (id: string) => {
    setSelectedAPId(id);
    setAmount("");
    setCompensationError(null);
  };

  const resetForm = () => {
    setPendingConfirmation(null);
  };

  const fireNormalPayment = (payload: NormalPayload) => {
    createPayment.mutate(
      {
        accountsPaymentId: account.id,
        payerId: account.debtorId,
        receiverId: account.creditorId,
        amount: payload.amount,
        paymentDate: formatDateToISO(payload.paymentDate),
        paymentMethod: payload.paymentMethod,
        folio: payload.folio,
        note: payload.note,
        driverId: payload.driverId,
        routeId: payload.routeId,
      },
      {
        onSuccess: (data) => {
          const folioPart = (data as { folio?: string })?.folio;
          const message = folioPart
            ? `Pago registrado · Folio ${folioPart} · ${formatMXN(payload.amount)}`
            : `Pago registrado · ${formatMXN(payload.amount)}`;
          onSuccessToast?.(message);
          onClose();
        },
      },
    );
  };

  const fireCompensationPayment = (payload: CompensationPayload) => {
    createCompensationPayment.mutate(
      {
        branchCedisAccountsPayableId: account.id,
        cedisSupplierAccountsPayableId: payload.cedisSupplierAccountsPayableId,
        amount: payload.amount,
        date: formatDateToISO(payload.paymentDate),
        folio: payload.folio,
        note: payload.note,
      },
      {
        onSuccess: () => {
          onSuccessToast?.(
            `Compensación registrada · ${formatMXN(payload.amount)}`,
          );
          onClose();
        },
      },
    );
  };

  const buildNormalPayload = (): NormalPayload | null => {
    const value = Number(amount);
    if (!value || value <= 0 || !paymentDate) return null;
    return {
      kind: "NORMAL",
      amount: value,
      paymentDate,
      paymentMethod,
      folio,
      note,
      driverId: driverId ? Number(driverId) : undefined,
      routeId: routeId ? Number(routeId) : undefined,
    };
  };

  const buildCompensationPayload = (): CompensationPayload | null => {
    const value = Number(amount);
    if (!value || value <= 0 || !paymentDate) return null;
    if (!selectedAPId || !selectedPayable) return null;
    return {
      kind: "COMPENSATION",
      amount: value,
      paymentDate,
      folio,
      note,
      cedisSupplierAccountsPayableId: Number(selectedAPId),
      selectedPayable,
    };
  };

  const handleSubmit = () => {
    if (paymentKind === "NORMAL") {
      const payload = buildNormalPayload();
      if (!payload) return;
      if (payload.amount > CONFIRMATION_THRESHOLD) {
        setPendingConfirmation({ payload, branchCedisAccount: account });
        return;
      }
      fireNormalPayment(payload);
      return;
    }

    if (paymentKind === "COMPENSATION") {
      const payload = buildCompensationPayload();
      if (!payload) return;
      if (!selectedAPId) {
        setCompensationError("Selecciona una cuenta por pagar a compensar.");
        return;
      }
      if (!selectedPayable) {
        setCompensationError("La cuenta seleccionada ya no está disponible.");
        return;
      }
      if (payload.amount > maxCompensationAmount) {
        setCompensationError(
          `El monto no puede superar ${formatMXN(maxCompensationAmount)} (mínimo entre el saldo de la cuenta actual y el saldo de la cuenta a compensar).`,
        );
        return;
      }
      setCompensationError(null);
      if (payload.amount > CONFIRMATION_THRESHOLD) {
        setPendingConfirmation({ payload, branchCedisAccount: account });
        return;
      }
      fireCompensationPayment(payload);
    }
  };

  const handleConfirm = () => {
    if (!pendingConfirmation) return;
    if (pendingConfirmation.payload.kind === "NORMAL") {
      fireNormalPayment(pendingConfirmation.payload);
    } else {
      fireCompensationPayment(pendingConfirmation.payload);
    }
  };

  const submitDisabled =
    createPayment.isPending || createCompensationPayment.isPending;
  const mutationError =
    createPayment.error ?? createCompensationPayment.error ?? null;

  const value = Number(amount);
  const exceedsThreshold =
    Number.isFinite(value) && value > CONFIRMATION_THRESHOLD;

  return (
    <Modal
      show={open}
      onClose={onClose}
      size={pendingConfirmation ? "md" : "xl"}
    >
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {pendingConfirmation ? (
            <ConfirmationPanel
              pending={pendingConfirmation}
              onEdit={resetForm}
              onConfirm={handleConfirm}
              isSubmitting={submitDisabled}
            />
          ) : (
            <>
              {allowCompensation && (
                <div>
                  <Label>Tipo de pago</Label>
                  <div className="mt-2 flex flex-col gap-2 text-white sm:flex-row sm:gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentKind"
                        value="NORMAL"
                        checked={paymentKind === "NORMAL"}
                        onChange={() => setPaymentKind("NORMAL")}
                      />
                      Pago directo
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentKind"
                        value="COMPENSATION"
                        checked={paymentKind === "COMPENSATION"}
                        onChange={() => setPaymentKind("COMPENSATION")}
                      />
                      Depósito al proveedor
                    </label>
                  </div>
                </div>
              )}

              <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <p className="mt-1">
                  Saldo pendiente: <strong>{formatMXN(account.balance)}</strong>
                </p>
              </div>

              {mutationError && (
                <AccountingErrorAlert
                  error={mutationError}
                  title="No se pudo registrar el pago"
                />
              )}

              {paymentKind === "NORMAL" && (
                <NormalFormFields
                  amount={amount}
                  setAmount={setAmount}
                  paymentDate={paymentDate}
                  setPaymentDate={setPaymentDate}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  folio={folio}
                  setFolio={setFolio}
                  note={note}
                  setNote={setnote}
                  driverId={driverId}
                  setDriverId={setDriverId}
                  routeId={routeId}
                  setRouteId={setRouteId}
                  drivers={drivers}
                  routes={routes}
                  maxAmount={account.balance}
                  exceedsThreshold={exceedsThreshold}
                  threshold={CONFIRMATION_THRESHOLD}
                />
              )}

              {paymentKind === "COMPENSATION" && allowCompensation && (
                <>
                  <CompensationFlowDiagram />

                  <div>
                    <Label>Cuenta por pagar a compensar</Label>
                    <Select
                      value={selectedAPId}
                      onChange={(e) =>
                        handleSelectedPayableChange(e.target.value)
                      }
                    >
                      <option value="">Seleccione una cuenta por pagar</option>
                      {validPayables.map((ap) => (
                        <option key={ap.id} value={ap.id}>
                          {ap.creditorName} - {ap.solicitorName} -{" "}
                          {formatHumanDate(ap.date)} - {formatMXN(ap.balance)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Monto del depósito</Label>
                    <TextInput
                      type="number"
                      value={amount}
                      min={0}
                      max={
                        selectedPayable
                          ? maxCompensationAmount
                          : account.balance
                      }
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setCompensationError(null);
                      }}
                      color={compensationError ? "failure" : undefined}
                    />
                    {selectedPayable && (
                      <p className="mt-1 text-xs text-gray-400">
                        Máximo permitido: {formatMXN(maxCompensationAmount)}
                      </p>
                    )}
                    {compensationError && (
                      <p className="mt-1 text-xs text-red-400">
                        {compensationError}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Fecha</Label>
                    <Datepicker
                      required
                      value={paymentDate ?? undefined}
                      onChange={(date) => setPaymentDate(date)}
                      language="es"
                    />
                  </div>

                  <details className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-200">
                      Más opciones (folio, notas)
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label>Folio / referencia</Label>
                        <TextInput
                          value={folio}
                          onChange={(e) => setFolio(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Notas (Opcional)</Label>
                        <Textarea
                          rows={3}
                          value={note}
                          onChange={(e) => setnote(e.target.value)}
                        />
                      </div>
                    </div>
                  </details>
                </>
              )}
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        {pendingConfirmation ? (
          <>
            <Button color="gray" onClick={resetForm}>
              Editar
            </Button>
            <Button onClick={handleConfirm} disabled={submitDisabled}>
              Confirmar y registrar
            </Button>
          </>
        ) : (
          <>
            <Button color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitDisabled}>
              Registrar pago
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

interface NormalFieldsProps {
  amount: string;
  setAmount: (v: string) => void;
  paymentDate: Date | null;
  setPaymentDate: (v: Date | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
  folio: string;
  setFolio: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  driverId: string;
  setDriverId: (v: string) => void;
  routeId: string;
  setRouteId: (v: string) => void;
  drivers: { id: number; name: string }[] | undefined;
  routes: { id: number; name: string }[] | undefined;
  maxAmount: number;
  exceedsThreshold: boolean;
  threshold: number;
}

const NormalFormFields = ({
  amount,
  setAmount,
  paymentDate,
  setPaymentDate,
  paymentMethod,
  setPaymentMethod,
  folio,
  setFolio,
  note,
  setNote,
  driverId,
  setDriverId,
  routeId,
  setRouteId,
  drivers,
  routes,
  maxAmount,
  exceedsThreshold,
  threshold,
}: NormalFieldsProps) => {
  return (
    <>
      <div>
        <Label>Monto a pagar</Label>
        <TextInput
          type="number"
          value={amount}
          min={0}
          max={maxAmount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {exceedsThreshold && (
          <p className="mt-1 text-xs text-amber-400">
            Por seguridad, montos mayores a {formatMXN(threshold)} requieren
            confirmación.
          </p>
        )}
      </div>

      <div>
        <Label>Fecha del pago</Label>
        <Datepicker
          required
          value={paymentDate ?? undefined}
          onChange={(date) => setPaymentDate(date)}
          language="es"
        />
      </div>

      <div>
        <Label>Método de pago</Label>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        >
          <option value="DEPOSIT">Depósito</option>
          <option value="CASH">Efectivo</option>
          <option value="BANK_TRANSFER">Transferencia</option>
          <option value="CHECK">Cheque</option>
          <option value="OTHER">Otro</option>
        </Select>
      </div>

      <details className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-200">
          Más opciones (folio, chofer, ruta, notas)
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <Label>Folio / referencia (Sólo para depósito)</Label>
            <TextInput
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
          </div>

          <div>
            <Label>Chofer (Opcional)</Label>
            <Select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Seleccione un chofer</option>
              {drivers?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Ruta (Opcional)</Label>
            <Select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              <option value="">Seleccione una ruta</option>
              {routes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Notas (Opcional)</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </details>
    </>
  );
};

const CompensationFlowDiagram = () => {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
      <div className="flex flex-wrap items-center justify-center gap-2 font-medium">
        <span className="rounded-full bg-white px-3 py-1 text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-200 dark:shadow-none">
          Sucursal
        </span>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-white px-3 py-1 text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-200 dark:shadow-none">
          CEDIS
        </span>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-white px-3 py-1 text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-200 dark:shadow-none">
          Proveedor
        </span>
      </div>
      <p className="mt-2 text-center text-xs text-blue-700 italic dark:text-blue-200">
        Ambas deudas se reducen en el mismo monto.
      </p>
    </div>
  );
};

interface ConfirmationPanelProps {
  pending: PendingConfirmation;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const ConfirmationPanel = ({
  pending,
  onEdit,
  onConfirm,
  isSubmitting,
}: ConfirmationPanelProps) => {
  const { payload, branchCedisAccount } = pending;
  const isNormal = payload.kind === "NORMAL";

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        <p className="font-medium">Confirma el pago antes de registrarlo</p>
        <p className="mt-1 text-xs">
          Estás a punto de registrar un pago por{" "}
          <strong>{formatMXN(payload.amount)}</strong>. Revisa los detalles
          antes de continuar.
        </p>
      </div>

      <dl className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white text-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Tipo</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">
            {isNormal ? "Pago directo" : "Compensación con proveedor"}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Monto</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">
            {formatMXN(payload.amount)}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
          <dd className="font-medium text-gray-800 dark:text-gray-100">
            {formatHumanDate(payload.paymentDate)}
          </dd>
        </div>
        <div className="flex justify-between px-4 py-2">
          <dt className="text-gray-500 dark:text-gray-400">Cuenta actual</dt>
          <dd className="text-right text-gray-800 dark:text-gray-100">
            {branchCedisAccount.debtorName} → {branchCedisAccount.creditorName}
          </dd>
        </div>
        {!isNormal && payload.kind === "COMPENSATION" && (
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500 dark:text-gray-400">
              Cuenta a compensar
            </dt>
            <dd className="text-right text-gray-800 dark:text-gray-100">
              {payload.selectedPayable.debtorName} →{" "}
              {payload.selectedPayable.creditorName}
            </dd>
          </div>
        )}
        {payload.folio && (
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500 dark:text-gray-400">Folio</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-100">
              {payload.folio}
            </dd>
          </div>
        )}
      </dl>

      <div className="flex justify-end gap-2">
        <Button color="gray" onClick={onEdit} disabled={isSubmitting}>
          Editar
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          Confirmar y registrar
        </Button>
      </div>
    </div>
  );
};

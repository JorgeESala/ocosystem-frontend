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
import { useState, useEffect, useMemo } from "react";
import type { AccountsPayableResponse } from "../../live-chicken/accounting/accounts-payable/types";
import type { PaymentMethod } from "../types/payment.types";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useRoutes } from "../../live-chicken/api/routes.queries";
import {
  useCreateCompensationPaymentFromAP,
  useCreatePayment,
} from "@/features/accounting/api/payments.queries";
import { AccountingErrorAlert } from "./AccountingErrorAlert";
import { SearchableSelect } from "@/components/SearchableSelect";

const CONFIRMATION_THRESHOLD = 10_000;

interface Props {
  open: boolean;
  onClose: () => void;
  allowCompensation?: boolean;
  onSuccessToast?: (message: string) => void;
  primaryAccounts: AccountsPayableResponse[];
  secondaryAccounts: AccountsPayableResponse[];
  primaryLoading: boolean;
  secondaryLoading: boolean;
}

type PaymentKind = "NORMAL" | "COMPENSATION";

type NormalPayload = {
  kind: "NORMAL";
  ap: AccountsPayableResponse;
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
  branchAp: AccountsPayableResponse;
  supplierAp: AccountsPayableResponse;
  amount: number;
  paymentDate: Date;
  folio: string;
  note: string;
};

type PendingConfirmation = {
  payload: NormalPayload | CompensationPayload;
};

export const RegisterPaymentFirstModal = ({
  open,
  onClose,
  allowCompensation = true,
  onSuccessToast,
  primaryAccounts,
  secondaryAccounts,
  primaryLoading,
  secondaryLoading,
}: Props) => {
  const createPayment = useCreatePayment();
  const createCompensationPayment = useCreateCompensationPaymentFromAP();
  const { data: drivers } = useDrivers();
  const { data: routes } = useRoutes();

  const [paymentKind, setPaymentKind] = useState<PaymentKind>("NORMAL");
  const [selectedAp, setSelectedAp] = useState<AccountsPayableResponse | null>(
    null,
  );
  const [selectedSupplierAp, setSelectedSupplierAp] =
    useState<AccountsPayableResponse | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [note, setnote] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [compensationError, setCompensationError] = useState<string | null>(
    null,
  );
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const validPayables = useMemo(
    () => primaryAccounts.filter((ap) => ap.balance > 0),
    [primaryAccounts],
  );

  const validSuppliers = useMemo(
    () =>
      secondaryAccounts.filter(
        (ap) => ap.balance > 0 && ap.debtorName !== ap.creditorName,
      ),
    [secondaryAccounts],
  );

  const maxCompensationAmount = Math.min(
    selectedAp?.balance ?? Infinity,
    selectedSupplierAp?.balance ?? Infinity,
  );

  useEffect(() => {
    if (open) {
      setPaymentKind("NORMAL");
      setSelectedAp(null);
      setSelectedSupplierAp(null);
      setAmount("");
      setPaymentDate(new Date());
      setPaymentMethod("DEPOSIT");
      setFolio("");
      setnote("");
      setDriverId("");
      setRouteId("");
      setCompensationError(null);
      setPendingConfirmation(null);
    }
  }, [open]);

  const resetForm = () => {
    setSelectedAp(null);
    setSelectedSupplierAp(null);
    setAmount("");
    setPaymentDate(new Date());
    setFolio("");
    setnote("");
    setDriverId("");
    setRouteId("");
    setCompensationError(null);
    setPendingConfirmation(null);
  };

  const fireNormalPayment = (p: NormalPayload) => {
    createPayment.mutate(
      {
        accountsPaymentId: p.ap.id,
        payerId: p.ap.debtorId,
        receiverId: p.ap.creditorId,
        amount: p.amount,
        paymentDate: formatDateToISO(p.paymentDate),
        paymentMethod: p.paymentMethod,
        folio: p.folio,
        note: p.note,
        driverId: p.driverId,
        routeId: p.routeId,
      },
      {
        onSuccess: (data) => {
          const folioPart = (data as { folio?: string })?.folio;
          const message = folioPart
            ? `Pago registrado · Folio ${folioPart} · ${formatMXN(p.amount)}`
            : `Pago registrado · ${formatMXN(p.amount)}`;
          onSuccessToast?.(message);
          resetForm();
        },
      },
    );
  };

  const fireCompensationPayment = (p: CompensationPayload) => {
    createCompensationPayment.mutate(
      {
        branchCedisAccountsPayableId: p.branchAp.id,
        cedisSupplierAccountsPayableId: p.supplierAp.id,
        amount: p.amount,
        date: formatDateToISO(p.paymentDate),
        folio: p.folio,
        note: p.note,
      },
      {
        onSuccess: () => {
          onSuccessToast?.(
            `Compensación registrada · ${formatMXN(p.amount)}`,
          );
          resetForm();
        },
      },
    );
  };

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0 || !paymentDate) return;

    if (paymentKind === "NORMAL") {
      if (!selectedAp) return;
      const payload: NormalPayload = {
        kind: "NORMAL",
        ap: selectedAp,
        amount: value,
        paymentDate,
        paymentMethod,
        folio,
        note,
        driverId: driverId ? Number(driverId) : undefined,
        routeId: routeId ? Number(routeId) : undefined,
      };
      if (value > CONFIRMATION_THRESHOLD) {
        setPendingConfirmation({ payload });
        return;
      }
      fireNormalPayment(payload);
      return;
    }

    if (paymentKind === "COMPENSATION") {
      if (!selectedAp || !selectedSupplierAp) {
        setCompensationError(
          "Selecciona la cuenta sucursal y la cuenta a compensar.",
        );
        return;
      }
      if (value > maxCompensationAmount) {
        setCompensationError(
          `El monto no puede superar ${formatMXN(maxCompensationAmount)} (mínimo entre el saldo de la cuenta actual y el saldo de la cuenta a compensar).`,
        );
        return;
      }
      setCompensationError(null);
      const payload: CompensationPayload = {
        kind: "COMPENSATION",
        branchAp: selectedAp,
        supplierAp: selectedSupplierAp,
        amount: value,
        paymentDate,
        folio,
        note,
      };
      if (value > CONFIRMATION_THRESHOLD) {
        setPendingConfirmation({ payload });
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
    <Modal show={open} onClose={onClose} size={pendingConfirmation ? "md" : "xl"}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {pendingConfirmation ? (
            <FirstConfirmationPanel
              pending={pendingConfirmation}
              onEdit={() => setPendingConfirmation(null)}
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
                        onChange={() => {
                          setPaymentKind("NORMAL");
                          setSelectedSupplierAp(null);
                          setCompensationError(null);
                        }}
                      />
                      Pago directo
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentKind"
                        value="COMPENSATION"
                        checked={paymentKind === "COMPENSATION"}
                        onChange={() => {
                          setPaymentKind("COMPENSATION");
                          setCompensationError(null);
                        }}
                      />
                      Depósito al proveedor
                    </label>
                  </div>
                </div>
              )}

              {mutationError && (
                <AccountingErrorAlert
                  error={mutationError}
                  title="No se pudo registrar el pago"
                />
              )}

              <div>
                <Label>Monto a pagar</Label>
                <TextInput
                  type="number"
                  value={amount}
                  min={0}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setCompensationError(null);
                  }}
                />
                {exceedsThreshold && (
                  <p className="mt-1 text-xs text-amber-400">
                    Por seguridad, montos mayores a{" "}
                    {formatMXN(CONFIRMATION_THRESHOLD)} requieren
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
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                >
                  <option value="DEPOSIT">Depósito</option>
                  <option value="CASH">Efectivo</option>
                  <option value="BANK_TRANSFER">Transferencia</option>
                  <option value="CHECK">Cheque</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </div>

              {paymentKind === "NORMAL" ? (
                <div>
                  <Label>Cuenta</Label>
                  <SearchableSelect<AccountsPayableResponse>
                    items={validPayables}
                    selected={selectedAp}
                    onChange={(item) => setSelectedAp(item)}
                    getValue={(ap) => ap.id}
                    getLabel={(ap) => `${ap.debtorName} → ${ap.creditorName}`}
                    getSubtitle={(ap) =>
                      `${formatHumanDate(ap.date)} · ${formatMXN(ap.balance)}`
                    }
                    placeholder="Buscar cuenta por pagar..."
                    emptyMessage={
                      primaryLoading
                        ? "Cargando..."
                        : "No hay cuentas pendientes"
                    }
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label>Cuenta sucursal → CEDIS</Label>
                    <SearchableSelect<AccountsPayableResponse>
                      items={validPayables}
                      selected={selectedAp}
                      onChange={(item) => {
                        setSelectedAp(item);
                        setSelectedSupplierAp(null);
                        setCompensationError(null);
                      }}
                      getValue={(ap) => ap.id}
                      getLabel={(ap) =>
                        `${ap.debtorName} → ${ap.creditorName}`
                      }
                      getSubtitle={(ap) =>
                        `${formatHumanDate(ap.date)} · ${formatMXN(ap.balance)}`
                      }
                      placeholder="Buscar cuenta sucursal..."
                      emptyMessage={
                        primaryLoading
                          ? "Cargando..."
                          : "No hay cuentas pendientes"
                      }
                    />
                  </div>
                  <div>
                    <Label>Cuenta CEDIS → proveedor</Label>
                    <SearchableSelect<AccountsPayableResponse>
                      items={validSuppliers}
                      selected={selectedSupplierAp}
                      onChange={(item) => {
                        setSelectedSupplierAp(item);
                        setCompensationError(null);
                      }}
                      getValue={(ap) => ap.id}
                      getLabel={(ap) =>
                        `${ap.debtorName} → ${ap.creditorName}`
                      }
                      getSubtitle={(ap) =>
                        `${formatHumanDate(ap.date)} · ${formatMXN(ap.balance)}`
                      }
                      placeholder={
                        selectedAp
                          ? "Buscar cuenta a compensar..."
                          : "Selecciona primero la cuenta sucursal"
                      }
                      emptyMessage={
                        secondaryLoading
                          ? "Cargando..."
                          : "No hay cuentas a compensar"
                      }
                      disabled={!selectedAp}
                    />
                    {selectedAp && selectedSupplierAp && (
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
                </>
              )}

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
                      onChange={(e) => setnote(e.target.value)}
                    />
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        {pendingConfirmation ? (
          <>
            <Button color="gray" onClick={() => setPendingConfirmation(null)}>
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

interface FirstConfirmationPanelProps {
  pending: PendingConfirmation;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const FirstConfirmationPanel = ({
  pending,
  onEdit,
  onConfirm,
  isSubmitting,
}: FirstConfirmationPanelProps) => {
  const { payload } = pending;
  const isNormal = payload.kind === "NORMAL";
  const ap = isNormal ? payload.ap : payload.branchAp;
  const secondaryAp = !isNormal ? payload.supplierAp : null;

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
          <dt className="text-gray-500 dark:text-gray-400">
            {isNormal ? "Cuenta" : "Cuenta sucursal → CEDIS"}
          </dt>
          <dd className="text-right text-gray-800 dark:text-gray-100">
            {ap.debtorName} → {ap.creditorName}
          </dd>
        </div>
        {secondaryAp && (
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500 dark:text-gray-400">
              Cuenta CEDIS → proveedor
            </dt>
            <dd className="text-right text-gray-800 dark:text-gray-100">
              {secondaryAp.debtorName} → {secondaryAp.creditorName}
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

export default RegisterPaymentFirstModal;

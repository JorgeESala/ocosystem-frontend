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
import type { AccountsPayableResponse } from "../accounts-payable/types";
import {
  useCreateCompensationPaymentFromAP,
  useCreatePayment,
} from "../payments/api/payments.queries";
import type { PaymentMethod } from "../payments/types";
import { formatDateToISO, formatHumanDate } from "@/utils/date.utils";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useRoutes } from "../../api/routes.queries";
import { useOpenAccounts } from "../accounts-payable/api/accounts-payable.queries";
import { formatMXN } from "@/utils/moneyNumbers";
interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
}

export const RegisterPaymentModal = ({ open, onClose, account }: Props) => {
  type PaymentKind = "NORMAL" | "COMPENSATION";

  const createPayment = useCreatePayment();
  const createCompensationPayment = useCreateCompensationPaymentFromAP();

  const { data: drivers } = useDrivers();
  const { data: routes } = useRoutes();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [notes, setNotes] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [paymentKind, setPaymentKind] = useState<PaymentKind>("NORMAL");
  const [selectedAPId, setSelectedAPId] = useState("");

  const CEDIS_ID = account?.creditorId;

  const { data: payableAccounts = [] } = useOpenAccounts({
    debtorId: CEDIS_ID,
  });

  const validPayables = payableAccounts.filter((ap) => ap.balance > 0);

  // reset when opening
  useEffect(() => {
    if (open && account) {
      setPaymentKind("NORMAL");
      setPaymentDate(new Date());
      setFolio("");
      setNotes("");
      setPaymentMethod("DEPOSIT");
      setAmount("");
      setDriverId("");
      setRouteId("");
    }
  }, [open, account]);

  if (!account) return null;

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (!paymentDate) return;
    if (paymentKind === "NORMAL") {
      createPayment.mutate(
        {
          accountsPaymentId: account.id,
          payerId: account.debtorId,
          receiverId: account.creditorId,

          amount: value,
          paymentDate: formatDateToISO(paymentDate),
          paymentMethod,
          folio,
          notes,
          driverId: Number(driverId),
          routeId: Number(routeId),
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }

    if (paymentKind === "COMPENSATION") {
      createCompensationPayment.mutate(
        {
          branchCedisAccountsPayableId: account.id,
          cedisSupplierAccountsPayableId: Number(selectedAPId),
          amount: value,
          date: formatDateToISO(paymentDate),
          folio,
          note: notes,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          <div>
            <Label>Tipo de pago</Label>
            <div className="mt-2 flex gap-4 text-white">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentKind"
                  value="NORMAL"
                  checked={paymentKind === "NORMAL"}
                  onChange={() => setPaymentKind("NORMAL")}
                />
                Pago al CEDIS
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

          {/* Context */}
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p className="mt-1">
              Saldo pendiente: <strong>${account.balance.toFixed(2)}</strong>
            </p>
          </div>

          {/* Normal payment (no compensation) */}
          {paymentKind === "NORMAL" && (
            <>
              {/* Amount */}
              <div>
                <Label>Monto a pagar</Label>
                <TextInput
                  type="number"
                  value={amount}
                  min={0}
                  max={account.balance}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Date */}
              <div>
                <Label>Fecha del pago</Label>
                <Datepicker
                  required
                  value={paymentDate ?? undefined}
                  onChange={(date) => setPaymentDate(date)}
                  language="es"
                />
              </div>

              {/* Method */}
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
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CHECK">Cheque</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </div>

              {/* Folio */}
              <div>
                <Label>Folio / referencia (Sólo para depósito)</Label>
                <TextInput
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                />
              </div>

              {/* Driver */}
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

              {/* Route */}
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

              {/* Notes */}
              <div>
                <Label>Notas (Opcional)</Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}

          {paymentKind === "COMPENSATION" && (
            <>
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                Este pago afecta 2 cuentas, la cuenta de la sucursal con el
                CEDIS y del CEDIS con el proveedor.
              </div>

              <div>
                <Label>Cuenta por pagar a compensar</Label>
                <Select
                  value={selectedAPId}
                  onChange={(e) => setSelectedAPId(e.target.value)}
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
                  max={account.balance}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Folio / referencia</Label>
                <TextInput
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                />
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

              <div>
                <Label>Notas (Opcional)</Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={createPayment.isPending}>
          Registrar pago
        </Button>
      </ModalFooter>
    </Modal>
  );
};

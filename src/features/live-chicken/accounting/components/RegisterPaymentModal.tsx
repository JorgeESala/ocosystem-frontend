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
import { useCreatePayment } from "../payments/api/payments.queries";
import type { PaymentMethod } from "../payments/types";
import { formatDateToISO } from "@/utils/date.utils";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { useRoutes } from "../../api/routes.queries";
interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse;
}

export const RegisterPaymentModal = ({ open, onClose, account }: Props) => {
  const createPayment = useCreatePayment();
  const { data: drivers } = useDrivers();
  const { data: routes } = useRoutes();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DEPOSIT");
  const [folio, setFolio] = useState("");
  const [notes, setNotes] = useState("");
  const [driverId, setDriverId] = useState("");
  const [routeId, setRouteId] = useState("");

  // reset when opening
  useEffect(() => {
    if (open && account) {
      setPaymentDate(new Date());
      setFolio("");
      setNotes("");
      setPaymentMethod("DEPOSIT");
    }
  }, [open, account]);

  if (!account) return null;

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (!paymentDate) return;

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
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Registrar pago</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Context */}
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p className="mt-1">
              Saldo pendiente: <strong>${account.balance.toFixed(2)}</strong>
            </p>
          </div>

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

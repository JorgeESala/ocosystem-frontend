import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Select,
  TextInput,
  Textarea,
  Datepicker,
} from "flowbite-react";
import { useState } from "react";

import { formatDateToISO } from "@/utils/date.utils";
import { useAccountingEntities } from "@/features/accounting/api/accounting-entities.queries";
import { useCreateAccountsPayable } from "@/features/accounting/api/accounts-payable.queries";
import { formatAccountingEntityLabel } from "@/features/live-chicken/accounting/accounts-payable/utils/entityLabel";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateBranchAccountsPayableModal = ({ open, onClose }: Props) => {
  const FCP_CEDIS_ID = 2; // ID fijo para el CEDIS FCP
  const { data: entities, isLoading } = useAccountingEntities();
  const createMutation = useCreateAccountsPayable();
  const [creditorId, setCreditorId] = useState<number>(FCP_CEDIS_ID);
  const [debtorId, setDebtorId] = useState<number>();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [solicitorId, setSolicitorId] = useState<number>();
  const [debtDate, setDate] = useState<Date | null>(new Date());

  const handleSubmit = () => {
    if (!creditorId || !debtorId || !amount) return;

    const creditor = entities?.find((e) => e.id === creditorId);
    const debtor = entities?.find((e) => e.id === debtorId);

    if (!creditor || !debtor) return;
    if (!debtDate) return;
    createMutation.mutate(
      {
        creditorType: creditor.entityType,
        creditorEntityId: creditor.id,
        debtorType: debtor.entityType,
        debtorEntityId: debtor.id,
        solicitorId: solicitorId ? Number(solicitorId) : undefined,
        sourceType: "ADJUSTMENT",
        amount: Number(amount),
        notes,
        date: formatDateToISO(debtDate),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  const handleCreditorChange = (id: number) => {
    setCreditorId(id);
    setSolicitorId(undefined);
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Crear cuenta</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Creditor */}
          <div>
            <Label>Entidad que otorga el crédito</Label>
            <Select
              value={creditorId ?? ""}
              onChange={(e) => handleCreditorChange(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value="">Selecciona entidad</option>
              {entities?.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatAccountingEntityLabel(e)}
                </option>
              ))}
            </Select>
          </div>

          {/* Debtor */}
          <div>
            <Label>Entidad que debe</Label>
            <Select
              value={debtorId ?? ""}
              onChange={(e) => setDebtorId(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value="">Selecciona entidad</option>
              {entities?.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatAccountingEntityLabel(e)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Fecha de la cuenta</Label>
            <Datepicker
              required
              value={debtDate ?? undefined}
              onChange={(date) => setDate(date)}
              language="es"
            />
          </div>
          {/* Amount */}
          <div>
            <Label>Monto</Label>
            <TextInput
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notas (opcional)</Label>
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
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          Crear cuenta
        </Button>
      </ModalFooter>
    </Modal>
  );
};

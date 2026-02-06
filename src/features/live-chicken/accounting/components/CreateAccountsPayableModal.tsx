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
} from "flowbite-react";
import { useState } from "react";
import { useAccountingEntities } from "../accounts-payable/api/accounting-entities.queries";
import { useCreateAccountsPayable } from "../accounts-payable/api/accounts-payable.queries";
import { formatAccountingEntityLabel } from "../accounts-payable/utils/entityLabel";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateAccountsPayableModal = ({ open, onClose }: Props) => {
  const { data: entities, isLoading } = useAccountingEntities();
  const createMutation = useCreateAccountsPayable();

  const [creditorId, setCreditorId] = useState<number>();
  const [debtorId, setDebtorId] = useState<number>();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!creditorId || !debtorId || !amount) return;

    const creditor = entities?.find((e) => e.id === creditorId);
    const debtor = entities?.find((e) => e.id === debtorId);

    if (!creditor || !debtor) return;

    createMutation.mutate(
      {
        creditorType: creditor.entityType,
        creditorEntityId: creditor.id,
        debtorType: debtor.entityType,
        debtorEntityId: debtor.id,
        sourceType: "ADJUSTMENT",
        amount: Number(amount),
        notes,
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
      <ModalHeader>Crear deuda</ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Creditor */}
          <div>
            <Label>Entidad que otorga el crédito</Label>
            <Select
              value={creditorId ?? ""}
              onChange={(e) => setCreditorId(Number(e.target.value))}
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
          Crear deuda
        </Button>
      </ModalFooter>
    </Modal>
  );
};

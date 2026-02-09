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
import { useAccountingEntities } from "../accounts-payable/api/accounting-entities.queries";
import { useCreateAccountsPayable } from "../accounts-payable/api/accounts-payable.queries";
import { formatAccountingEntityLabel } from "../accounts-payable/utils/entityLabel";
import { formatDateToISO } from "@/utils/date.utils";
import { useSolicitors } from "../accounts-payable/api/solicitor.queries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateAccountsPayableModal = ({ open, onClose }: Props) => {
  const { data: entities, isLoading } = useAccountingEntities();
  const createMutation = useCreateAccountsPayable();
  const { data: solicitors } = useSolicitors();
  const [creditorId, setCreditorId] = useState<number>();
  const [debtorId, setDebtorId] = useState<number>();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [solicitorId, setSolicitorId] = useState<number>();
  const [debtDate, setDate] = useState<Date | null>(new Date());

  const selectedCreditor = entities?.find((e) => e.id === creditorId);
  const isSupplier = selectedCreditor?.entityType === "SUPPLIER";

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

          {/* Solicitor */}
          {isSupplier && (
            <div>
              <Label>Solicitante</Label>
              <Select
                value={solicitorId ?? ""}
                onChange={(e) => setSolicitorId(Number(e.target.value))}
              >
                <option value="">Selecciona una entidad</option>
                {solicitors?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
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

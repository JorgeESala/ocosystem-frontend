import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import ExpenseForm from "./ExpenseForm";
import { Expense } from "../services/api";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (expense: Expense) => void;
  expenseToEdit?: Expense | null; // null = crear, objeto = editar
}

export default function ExpenseModal({
  open,
  onClose,
  onCreated,
  expenseToEdit = null,
}: ExpenseModalProps) {
  const isEditing = Boolean(expenseToEdit);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>{isEditing ? "Editar Gasto" : "Crear Gasto"}</ModalHeader>

      <ModalBody>
        <ExpenseForm
          initialData={expenseToEdit ?? undefined}
          onSaved={(exp) => {
            onCreated(exp);
            onClose();
          }}
          onCancel={onClose}
        />
      </ModalBody>
    </Modal>
  );
}

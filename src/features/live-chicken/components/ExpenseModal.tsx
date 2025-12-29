import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import ExpenseForm from "./ExpenseForm";
import type { ExpenseResponseDTO } from "../types";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseResponseDTO | null; // null = crear
}

export default function ExpenseModal({
  open,
  onClose,
  expenseToEdit = null,
}: ExpenseModalProps) {
  const isEditing = Boolean(expenseToEdit);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>{isEditing ? "Editar Gasto" : "Crear Gasto"}</ModalHeader>

      <ModalBody>
        <ExpenseForm
          initialData={expenseToEdit ?? undefined}
          onSaved={onClose}
          onCancel={onClose}
        />
      </ModalBody>
    </Modal>
  );
}

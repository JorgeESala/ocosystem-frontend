import { Modal, ModalHeader, ModalBody } from "flowbite-react";

import ExpenseEntryForm from "./ExpenseEntryForm";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expenseToEdit?: null;
}

export default function ExpenseEntryModal({
  open,
  onClose,
  expenseToEdit = null,
}: ExpenseModalProps) {
  const isEditing = Boolean(expenseToEdit);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>{isEditing ? "Editar gasto" : "Nuevo gasto"}</ModalHeader>

      <ModalBody>
        <ExpenseEntryForm
          mode={isEditing ? "edit" : "create"}
          initialData={expenseToEdit ?? undefined}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </ModalBody>
    </Modal>
  );
}

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import BranchExpenseForm from "./BranchExpenseForm";
import type { BranchExpenseResponseDTO } from "../types";

interface BranchExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (expense: BranchExpenseResponseDTO) => void;
  expenseToEdit?: BranchExpenseResponseDTO | null;
  loading?: boolean;
}

export default function BranchExpenseModal({
  open,
  onClose,
  onCreated,
  expenseToEdit = null,
  loading,
}: BranchExpenseModalProps) {
  const isEditing = Boolean(expenseToEdit);

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>{isEditing ? "Editar gasto" : "Crear gasto"}</ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="py-6 text-center text-gray-400">
            Cargando gasto...
          </div>
        ) : (
          <BranchExpenseForm
            initialData={expenseToEdit ?? undefined}
            onSaved={(expense) => {
              onCreated(expense);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </ModalBody>
    </Modal>
  );
}

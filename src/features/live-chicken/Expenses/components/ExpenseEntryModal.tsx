import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import ExpenseEntryForm from "./ExpenseEntryForm";
import { useCreateExpense, useUpdateExpense } from "../api/expense.queries";
import { mapFormToCreateDTO, mapFormToUpdateDTO } from "../api/expense.mapper";
import type { ExpenseDetailResponseDTO } from "../types/expense.types";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseDetailResponseDTO;
  loading?: boolean;
}

export default function ExpenseEntryModal({
  open,
  onClose,
  loading,
  expenseToEdit,
}: ExpenseModalProps) {
  const isEditing = Boolean(expenseToEdit?.id);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const handleSubmit = ({
    categoryCode,
    form,
  }: {
    categoryCode: any;
    form: any;
  }) => {
    if (isEditing && expenseToEdit) {
      const dto = mapFormToUpdateDTO(categoryCode, form);

      updateExpense.mutate(
        {
          id: expenseToEdit.id,
          payload: dto,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      const dto = mapFormToCreateDTO(categoryCode, form);

      createExpense.mutate(dto, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>
        {expenseToEdit ? "Editar gasto" : "Nuevo gasto"}
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="py-6 text-center text-gray-400">
            Cargando gasto...
          </div>
        ) : (
          <ExpenseEntryForm
            mode={expenseToEdit ? "edit" : "create"}
            initialData={expenseToEdit}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </ModalBody>
    </Modal>
  );
}

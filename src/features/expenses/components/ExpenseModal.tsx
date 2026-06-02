import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import ExpenseEntryForm from "./ExpenseEntryForm";
import {
  useCreateExpense,
  useUpdateExpense,
  useExpenseById,
} from "../api/expense.queries";
import { mapFormToCreateDTO, mapFormToUpdateDTO } from "../api/expense.mapper";
import type { ExpensesUnitType } from "../types/expense.types";

interface ExpenseModalProps {
  unitType: ExpensesUnitType;
  open: boolean;
  onClose: () => void;
  expenseIdToEdit?: number | null;
}

export default function ExpenseModal({
  unitType,
  open,
  onClose,
  expenseIdToEdit,
}: ExpenseModalProps) {
  const isEditing = Boolean(expenseIdToEdit);
  const { data: expenseToEdit, isLoading: loadingExpense } = useExpenseById(
    unitType,
    expenseIdToEdit ?? null,
  );
  const createExpense = useCreateExpense(unitType);
  const updateExpense = useUpdateExpense(unitType);

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
        { id: expenseToEdit.id, payload: dto },
        { onSuccess: () => onClose() },
      );
    } else {
      const dto = mapFormToCreateDTO(categoryCode, form);
      createExpense.mutate(dto, { onSuccess: () => onClose() });
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <ModalHeader>{isEditing ? "Editar gasto" : "Nuevo gasto"}</ModalHeader>

      <ModalBody>
        {loadingExpense ? (
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

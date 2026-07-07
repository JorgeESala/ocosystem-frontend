import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";

interface ConfirmDeleteModalProps {
  show: boolean;
  title: string;
  message: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  title,
  message,
  isDeleting,
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} size="md" popup onClose={onCancel}>
    <ModalHeader />
    <ModalBody>
      <div className="text-center">
        <HiExclamationCircle className="mx-auto mb-4 text-red-500" size={56} />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </ModalBody>
    <ModalFooter className="justify-center">
      <Button color="red" onClick={onConfirm} disabled={isDeleting}>
        Sí, eliminar
      </Button>
      <Button color="gray" onClick={onCancel} disabled={isDeleting}>
        Cancelar
      </Button>
    </ModalFooter>
  </Modal>
);

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  isBusy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Continuar",
  cancelLabel = "Cancelar",
  tone = "default",
  isBusy = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal show={open} size="md" onClose={onClose}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-sm text-slate-300">{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose} disabled={isBusy}>
          {cancelLabel}
        </Button>
        <Button
          color={tone === "danger" ? "failure" : "blue"}
          onClick={onConfirm}
          disabled={isBusy}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

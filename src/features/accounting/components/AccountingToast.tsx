import { useEffect } from "react";
import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck } from "react-icons/hi";

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export const AccountingToast = ({ message, onDismiss }: Props) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Toast>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
          <HiCheck className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">{message}</div>
        <ToastToggle onDismiss={onDismiss} />
      </Toast>
    </div>
  );
};

export default AccountingToast;

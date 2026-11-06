import { useEffect } from "react";
import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck, HiXCircle } from "react-icons/hi";

interface Props {
  message: string | null;
  onDismiss: () => void;
  variant?: "success" | "failure";
  title?: string;
  autoDismissMs?: number | null;
}

export const AccountingToast = ({
  message,
  onDismiss,
  variant = "success",
  title,
  autoDismissMs = 4000,
}: Props) => {
  useEffect(() => {
    if (!message || autoDismissMs == null) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, autoDismissMs]);

  if (!message) return null;

  const isFailure = variant === "failure";

  return (
    <div className="fixed top-4 right-4 z-50">
      <Toast className="max-w-md">
        <div
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isFailure
              ? "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300"
              : "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
          }`}
        >
          {isFailure ? (
            <HiXCircle className="h-5 w-5" />
          ) : (
            <HiCheck className="h-5 w-5" />
          )}
        </div>
        <div className="ml-3 min-w-0 text-sm font-normal">
          {title && <div className="font-medium">{title}</div>}
          <div className={title ? "mt-1 break-words" : "break-words"}>
            {message}
          </div>
        </div>
        <ToastToggle onDismiss={onDismiss} />
      </Toast>
    </div>
  );
};

export default AccountingToast;

import { Alert, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { extractErrorMessage } from "../utils/errorMessage";

interface Props {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export const AccountingErrorAlert = ({
  error,
  title = "No se pudo cargar la información",
  onRetry,
}: Props) => {
  return (
    <Alert color="failure" icon={HiOutlineExclamationCircle} rounded>
      <div className="flex flex-col gap-2">
        <span className="font-medium">{title}</span>
        <span className="text-sm">{extractErrorMessage(error)}</span>
        {onRetry && (
          <div>
            <Button size="xs" color="failure" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AccountingErrorAlert;

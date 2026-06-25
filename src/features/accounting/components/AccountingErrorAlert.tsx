import { Alert, Button } from "flowbite-react";
import { AxiosError } from "axios";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface Props {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

const extractMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
    return `Error ${error.response?.status ?? "desconocido"} al comunicarse con el servidor.`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrió un error inesperado.";
};

export const AccountingErrorAlert = ({
  error,
  title = "No se pudo cargar la información",
  onRetry,
}: Props) => {
  return (
    <Alert color="failure" icon={HiOutlineExclamationCircle} rounded>
      <div className="flex flex-col gap-2">
        <span className="font-medium">{title}</span>
        <span className="text-sm">{extractMessage(error)}</span>
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

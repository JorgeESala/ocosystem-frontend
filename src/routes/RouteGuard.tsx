import { Alert } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import { useAuthRole } from "../hooks/useAuthRole";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAdmin } = useAuthRole();

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          <div className="flex items-center gap-2">
            <HiExclamationCircle className="h-5 w-5" />
            <span>No tienes permisos para ver esta página.</span>
          </div>
          <p className="mt-2 text-sm text-red-200">
            Contacta a un administrador si crees que esto es un error.
          </p>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

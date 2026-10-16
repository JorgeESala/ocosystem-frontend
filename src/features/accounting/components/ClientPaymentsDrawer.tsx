import {
  Drawer,
  DrawerHeader,
  DrawerItems,
  Button,
  Spinner,
} from "flowbite-react";
import { HiX } from "react-icons/hi";
import type { ClientPaid } from "../api/payments-summary.api";
import { ClientPaymentsTable } from "./ClientPaymentsTable";

interface Props {
  open: boolean;
  onClose: () => void;
  payers: ClientPaid[];
  isLoading: boolean;
  periodLabel?: string;
}

export const ClientPaymentsDrawer = ({
  open,
  onClose,
  payers,
  isLoading,
  periodLabel,
}: Props) => (
  <Drawer open={open} onClose={onClose} position="right" className="w-[560px]">
    <DrawerHeader>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Pagos por cliente en el periodo
          </h2>
          {periodLabel && (
            <p className="mt-1 text-xs text-gray-400">{periodLabel}</p>
          )}
        </div>
        <Button color="gray" size="xs" onClick={onClose}>
          <HiX className="h-4 w-4" />
        </Button>
      </div>
    </DrawerHeader>
    <DrawerItems>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : payers.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sin pagos registrados en el periodo para los filtros seleccionados.
        </p>
      ) : (
        <ClientPaymentsTable payers={payers} />
      )}
    </DrawerItems>
  </Drawer>
);

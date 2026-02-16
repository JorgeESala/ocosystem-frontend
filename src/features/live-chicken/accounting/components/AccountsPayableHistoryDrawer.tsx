import {
  Drawer,
  Spinner,
  Badge,
  DrawerItems,
  DrawerHeader,
} from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import {
  movementTypeLabels,
  type AccountsPayableResponse,
} from "../accounts-payable/types";
import { useAccountsPayableMovements } from "../accounts-payable/api/movements.queries";

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse | null;
}

export const AccountsPayableHistoryDrawer = ({
  open,
  onClose,
  account,
}: Props) => {
  const { data, isLoading } = useAccountsPayableMovements(account?.id);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-[500px]"
    >
      <DrawerHeader title="Historial de movimientos" />

      <DrawerItems>
        {!account ? null : (
          <div className="mb-6 space-y-1">
            <p className="text-sm text-gray-500">
              {account.debtorName} → {account.creditorName}
            </p>
            <p className="text-sm">
              Total: <strong>{formatMXN(account.totalAmount)}</strong>
            </p>
            <p className="text-sm">
              Saldo actual:{" "}
              <strong className="text-blue-600">
                {formatMXN(account.balance)}
              </strong>
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-6">
            {data.map((movement) => {
              const isPositive = Number(movement.amount) > 0;

              return (
                <div
                  key={movement.id}
                  className="relative border-l-4 pl-4"
                  style={{
                    borderColor: isPositive ? "#16a34a" : "#dc2626",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Badge color="gray">
                      {movementTypeLabels[movement.movementType]}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatHumanDate(movement.movementDate)}
                    </span>
                  </div>

                  <p
                    className={`font-semibold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {formatMXN(movement.amount)}
                  </p>

                  <p className="text-xs text-gray-500">
                    Saldo antes: {formatMXN(movement.balanceBefore)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Saldo después: {formatMXN(movement.balanceAfter)}
                  </p>

                  {movement.driverName && movement.routeName && (
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="font-medium">
                        {movement.driverName} {movement.routeName}
                      </span>
                    </p>
                  )}
                  {movement.folio && (
                    <p className="mt-1 text-xs text-gray-500">
                      Folio:{" "}
                      <span className="font-medium">{movement.folio}</span>
                    </p>
                  )}
                  {movement.notes && (
                    <p className="mt-1 text-xs">{movement.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};

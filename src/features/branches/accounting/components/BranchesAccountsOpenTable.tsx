import {
  Table,
  Button,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";

interface Props {
  data: AccountsPayableResponse[];
  onPay: (account: AccountsPayableResponse) => void;
  onViewHistory: (account: AccountsPayableResponse) => void;
}

export const BranchesAccountsOpenTable = ({
  data,
  onPay,
  onViewHistory,
}: Props) => {
  if (!data.length) {
    return <div className="text-sm text-gray-500">No hay cuentas abiertas</div>;
  }

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Relación</TableHeadCell>
        <TableHeadCell>Total</TableHeadCell>
        <TableHeadCell>Saldo</TableHeadCell>
        <TableHeadCell>Creada</TableHeadCell>
        <TableHeadCell> Acciones</TableHeadCell>
      </TableHead>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              {row.debtorName} → {row.creditorName}
            </TableCell>

            <TableCell>{formatMXN(row.totalAmount)}</TableCell>

            <TableCell className="font-semibold">
              {formatMXN(row.balance)}
            </TableCell>

            <TableCell>{formatHumanDate(row.date)}</TableCell>

            <TableCell className="flex gap-2">
              <Tooltip content="Registrar pago">
                <Button
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPay(row);
                  }}
                >
                  <FaMoneyBillWave size={20} />
                </Button>
              </Tooltip>
              <Tooltip content="Mostrar información">
                <Button
                  size="xs"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory(row);
                  }}
                >
                  <FaRegFileLines size={20} />
                </Button>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

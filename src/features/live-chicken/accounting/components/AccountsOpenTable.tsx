import {
  Table,
  Button,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import type { AccountsPayableResponse } from "../accounts-payable/types";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";

interface Props {
  data: AccountsPayableResponse[];
  onPay: (account: AccountsPayableResponse) => void;
  onViewHistory: (account: AccountsPayableResponse) => void;
}

export const AccountsOpenTable = ({ data, onPay, onViewHistory }: Props) => {
  if (!data.length) {
    return <div className="text-sm text-gray-500">No hay cuentas abiertas</div>;
  }

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Relación</TableHeadCell>
        <TableHeadCell>Solicitante</TableHeadCell>
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

            <TableCell>
              {row.solicitorName ? row.solicitorName : "N/A"}
            </TableCell>
            <TableCell>{formatMXN(row.totalAmount)}</TableCell>

            <TableCell className="font-semibold">
              {formatMXN(row.balance)}
            </TableCell>

            <TableCell>{formatHumanDate(row.date)}</TableCell>

            <TableCell className="flex gap-2">
              <Button
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onPay(row);
                }}
              >
                Pagar
              </Button>

              <Button
                size="xs"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory(row);
                }}
              >
                Historial
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

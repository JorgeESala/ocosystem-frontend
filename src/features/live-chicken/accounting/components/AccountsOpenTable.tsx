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

interface Props {
  data: AccountsPayableResponse[];
  onPay: (account: AccountsPayableResponse) => void;
}

export const AccountsOpenTable = ({ data, onPay }: Props) => {
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
        <TableHeadCell />
      </TableHead>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              {row.debtorName} →{row.creditorName}
            </TableCell>

            <TableCell>${row.totalAmount.toFixed(2)}</TableCell>

            <TableCell className="font-semibold">
              ${row.balance.toFixed(2)}
            </TableCell>

            <TableCell>
              {new Date(row.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell>
              <Button size="xs" onClick={() => onPay(row)}>
                Pagar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

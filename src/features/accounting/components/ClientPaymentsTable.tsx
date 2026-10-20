import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import type { ClientPaid } from "../api/payments-summary.api";

interface Props {
  payers: ClientPaid[];
  title?: string;
}

export const ClientPaymentsTable = ({ payers, title }: Props) => {
  if (payers.length === 0) return null;

  const totalCobrado = payers.reduce((sum, row) => sum + row.totalPaid, 0);
  const totalCompensado = payers.reduce((sum, row) => sum + row.compensated, 0);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      {title && (
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeadCell>Cliente</TableHeadCell>
              <TableHeadCell className="text-right">Pagos</TableHeadCell>
              <TableHeadCell className="text-right">
                Monto cobrado
              </TableHeadCell>
              <TableHeadCell className="text-right">
                Compensaciones
              </TableHeadCell>
              <TableHeadCell>Último pago</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payers.map((row) => (
              <TableRow key={row.payerEntityId}>
                <TableCell className="font-medium text-white">
                  {row.payerName}
                </TableCell>
                <TableCell className="text-right text-gray-300 tabular-nums">
                  {row.paymentCount}
                </TableCell>
                <TableCell className="text-right font-semibold text-emerald-300 tabular-nums">
                  {formatMXN(row.totalPaid)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.compensated > 0 ? (
                    <span className="text-blue-300">
                      {formatMXN(row.compensated)}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-300">
                  {row.lastPaymentDate ? (
                    formatHumanDate(row.lastPaymentDate, "short")
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold text-white">Total</TableCell>
              <TableCell className="text-right font-semibold text-gray-300 tabular-nums">
                {payers.reduce((sum, row) => sum + row.paymentCount, 0)}
              </TableCell>
              <TableCell className="text-right font-semibold text-emerald-300 tabular-nums">
                {formatMXN(totalCobrado)}
              </TableCell>
              <TableCell className="text-right font-semibold text-blue-300 tabular-nums">
                {totalCompensado > 0 ? formatMXN(totalCompensado) : "—"}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

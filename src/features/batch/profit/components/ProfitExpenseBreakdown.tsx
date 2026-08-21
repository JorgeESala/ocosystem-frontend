import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import type { ExpenseBreakdownItem } from "../types";
import { formatMXN } from "@/utils/moneyNumbers";

interface Props {
  items: ExpenseBreakdownItem[];
}

export const ProfitExpenseBreakdown: React.FC<Props> = ({ items }) => {
  if (items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">
          Gastos por categoría
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeadCell>Categoría</TableHeadCell>
              <TableHeadCell className="text-right">Cantidad</TableHeadCell>
              <TableHeadCell className="text-right">Monto</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.categoryCode}>
                <TableCell className="font-medium text-white">
                  {item.categoryName}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {item.count}
                </TableCell>
                <TableCell className="text-right text-yellow-300">
                  {formatMXN(item.amount)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold text-white">Total</TableCell>
              <TableCell className="text-right text-gray-300">
                {items.reduce((sum, item) => sum + item.count, 0)}
              </TableCell>
              <TableCell className="text-right font-semibold text-yellow-300">
                {formatMXN(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

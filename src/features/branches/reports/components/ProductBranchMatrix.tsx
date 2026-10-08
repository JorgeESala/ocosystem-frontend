import { useMemo } from "react";
import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { InfoTip } from "@/components/InfoTip";
import { formatMXNCompact } from "@/utils/moneyNumbers";
import { formatUnits, heatIntensity } from "../utils/productMetrics";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";

export type MatrixMetric = "sales" | "quantity";

interface Props {
  rows: ProductAnalyticsRowDTO[];
  branches: { id: number; name: string }[];
  metric: MatrixMetric;
  onMetricChange: (metric: MatrixMetric) => void;
  onSelectProduct: (barcode: string, productName: string) => void;
  isLoading?: boolean;
}

const valueOf = (
  row: ProductAnalyticsRowDTO,
  branchId: number,
  metric: MatrixMetric,
): number => {
  const breakdown = row.branchBreakdown.find(
    (item) => item.branchId === branchId,
  );
  if (!breakdown) return 0;
  return metric === "sales" ? breakdown.sales : breakdown.quantity;
};

const formatValue = (value: number, metric: MatrixMetric): string => {
  if (value === 0) return "—";
  return metric === "sales" ? formatMXNCompact(value) : formatUnits(value);
};

export const ProductBranchMatrix = ({
  rows,
  branches,
  metric,
  onMetricChange,
  onSelectProduct,
  isLoading,
}: Props) => {
  const maxValue = useMemo(() => {
    let max = 0;
    for (const row of rows) {
      for (const branch of branches) {
        max = Math.max(max, valueOf(row, branch.id, metric));
      }
    }
    return max;
  }, [rows, branches, metric]);

  const rowTotal = (row: ProductAnalyticsRowDTO) =>
    metric === "sales" ? row.sales : row.quantity;

  const hasCancelledSales = rows.some((row) => row.cancelledSubtotal < 0);

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-200">
            Productos por sucursal (Top {rows.length || 10})
            <InfoTip title="Cómo leer la matriz">
              Cada celda es la venta o unidades de ese producto en esa sucursal;
              entre más intenso el color, más vende. No incluye Merma ni
              Matados, y puedes ocultar pollo y huevo en los filtros de arriba.
            </InfoTip>
          </h3>
          <p className="text-xs text-gray-500">
            Haz clic en un producto para ver su detalle por sucursal
            {hasCancelledSales && " · incluye cancelaciones"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="xs"
            color={metric === "sales" ? "blue" : "gray"}
            onClick={() => onMetricChange("sales")}
          >
            Venta
          </Button>
          <Button
            size="xs"
            color={metric === "quantity" ? "blue" : "gray"}
            onClick={() => onMetricChange("quantity")}
          >
            Unidades
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-gray-700/40" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Sin ventas de productos en el rango seleccionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable className="dark">
            <TableHead>
              <TableRow>
                <TableHeadCell className="sticky left-0 z-10 bg-gray-900">
                  Producto
                </TableHeadCell>
                {branches.map((branch) => (
                  <TableHeadCell key={branch.id} className="text-center">
                    {branch.name}
                  </TableHeadCell>
                ))}
                <TableHeadCell className="text-right">Total</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-700">
              {rows.map((row) => (
                <TableRow
                  key={row.productBarcode}
                  className="cursor-pointer border-gray-700 bg-gray-800"
                  onClick={() =>
                    onSelectProduct(row.productBarcode, row.productName)
                  }
                >
                  <TableCell className="sticky left-0 z-10 bg-gray-800 font-medium text-white">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2">
                        {row.productName}
                        {(row.variantBarcodes?.length ?? 0) > 0 && (
                          <span className="rounded bg-indigo-900/60 px-1.5 py-0.5 text-[10px] font-normal text-indigo-300">
                            {(row.variantBarcodes?.length ?? 0) + 1} códigos
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">
                        {row.categoryName}
                      </span>
                    </div>
                  </TableCell>
                  {branches.map((branch) => {
                    const value = valueOf(row, branch.id, metric);
                    const intensity = heatIntensity(value, maxValue);
                    return (
                      <TableCell
                        key={branch.id}
                        className="text-center text-xs text-white"
                        style={{
                          backgroundColor:
                            intensity > 0
                              ? `rgba(59, 130, 246, ${0.08 + intensity * 0.45})`
                              : undefined,
                        }}
                      >
                        {formatValue(value, metric)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold text-blue-400">
                    {formatValue(rowTotal(row), metric)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

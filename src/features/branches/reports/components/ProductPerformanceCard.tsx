import {
  Alert,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useProductAnalytics } from "../api/productAnalytics.queries";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatUnits } from "../utils/productMetrics";
import { AbcBadge } from "./AbcBadge";
import { DeltaBadge } from "./DeltaBadge";

interface Props {
  branchId: number;
  dates: { start: Date; end: Date };
  excludeChicken?: boolean;
  excludeEgg?: boolean;
  onSelectProduct?: (barcode: string, productName: string) => void;
}

export const ProductPerformanceCard = ({
  branchId,
  dates,
  excludeChicken = false,
  excludeEgg = false,
  onSelectProduct,
}: Props) => {
  const { data, isLoading, isError } = useProductAnalytics(
    [branchId],
    dates.start,
    dates.end,
    { limit: 15, excludeChicken, excludeEgg },
  );

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-gray-800" />;
  }

  if (isError) {
    return (
      <Alert color="failure">
        Ocurrió un error al cargar el rendimiento de productos.
      </Alert>
    );
  }

  const products = data?.products ?? [];

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-200">
          Rendimiento de producto (Top 15)
          <InfoTip title="Rendimiento de producto">
            Los 15 productos con más venta del periodo. No incluye Merma ni
            Matados y respeta los filtros de pollo/huevo. Haz clic en un
            producto para ver su detalle.
          </InfoTip>
        </h3>
        <span className="text-xs text-gray-500">
          A = más vendidos · B = venta media · C = baja rotación (con todo el
          catálogo del periodo)
        </span>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Sin ventas de productos en el rango seleccionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable className="dark">
            <TableHead>
              <TableRow>
                <TableHeadCell>Producto</TableHeadCell>
                <TableHeadCell>Categoría</TableHeadCell>
                <TableHeadCell className="text-center">Clase</TableHeadCell>
                <TableHeadCell className="text-center">Cantidad</TableHeadCell>
                <TableHeadCell className="text-right">Venta real</TableHeadCell>
                <TableHeadCell className="text-center">
                  Días con venta
                </TableHeadCell>
                <TableHeadCell className="text-center">Prom./día</TableHeadCell>
                <TableHeadCell>vs. anterior</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-700">
              {products.map((product) => (
                <TableRow
                  key={product.productBarcode}
                  className={`border-gray-700 bg-gray-800 ${onSelectProduct ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    onSelectProduct?.(
                      product.productBarcode,
                      product.productName,
                    )
                  }
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex flex-col">
                      <span>{product.productName}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {product.productBarcode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {product.categoryName}
                  </TableCell>
                  <TableCell className="text-center">
                    <AbcBadge value={product.abcClass} />
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {formatUnits(product.quantity)}
                    <span className="ml-1 text-[10px] text-gray-500">
                      {product.unitName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-green-400">
                    {formatMXN(product.sales)}
                    {product.cancelledSubtotal < 0 && (
                      <div className="text-[10px] text-red-400">
                        Cancelaciones: {formatMXN(product.cancelledSubtotal)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {product.daysWithSales}
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {formatUnits(product.avgDailyQuantity)}
                  </TableCell>
                  <TableCell>
                    <DeltaBadge value={product.salesGrowth} suffix="" />
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

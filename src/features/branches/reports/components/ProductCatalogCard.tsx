import {
  Button,
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { InfoTip } from "@/components/InfoTip";
import { formatMXN } from "@/utils/moneyNumbers";
import { AbcBadge } from "./AbcBadge";
import { DeltaBadge } from "./DeltaBadge";
import { formatUnits } from "../utils/productMetrics";
import type { ProductAnalyticsRowDTO } from "../api/productAnalytics.api";
import type { MatrixMetric } from "./ProductBranchMatrix";

interface Props {
  rows: ProductAnalyticsRowDTO[];
  total: number;
  page: number;
  pageSize: number;
  metric: MatrixMetric;
  isLoading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelectProduct: (barcode: string, productName: string) => void;
}

export const ProductCatalogCard = ({
  rows,
  total,
  page,
  pageSize,
  metric,
  isLoading,
  searchValue,
  onSearchChange,
  onPageChange,
  onSelectProduct,
}: Props) => {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, page * pageSize + rows.length);
  const hasPrevious = page > 0;
  const hasNext = to < total;

  return (
    <Card className="border-none bg-gray-800 shadow-xl">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-200">
            Catálogo de productos
            <InfoTip title="Catálogo y clases ABC">
              Se ordenan de mayor a menor venta: clase A son los que juntos
              hacen el 80% (los clave), clase B los que llegan al 95% (venta
              media) y clase C el resto (baja rotación). Se calcula con todo el
              catálogo del periodo, sin Merma ni Matados, y no cambia al buscar
              ni al paginar. Solo cambia si ocultas pollo o huevo en "Ocultar en
              tops".
            </InfoTip>
          </h3>
          <p className="text-xs text-gray-500">
            Todo el catálogo, no solo el top. Haz clic en un producto para ver
            su detalle por sucursal.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TextInput
            icon={HiSearch}
            placeholder="Buscar en el catálogo..."
            className="w-full sm:w-72"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {total > 0 && (
            <span className="text-xs whitespace-nowrap text-gray-400">
              Mostrando {from}–{to} de {total}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No hay productos que coincidan con la búsqueda.
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
                <TableHeadCell className="text-right">
                  {metric === "sales" ? "Venta real" : "Unidades"}
                </TableHeadCell>
                <TableHeadCell className="text-center">
                  Días con venta
                </TableHeadCell>
                <TableHeadCell className="text-center">Prom./día</TableHeadCell>
                <TableHeadCell>vs. anterior</TableHeadCell>
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
                  <TableCell className="font-medium text-white">
                    <div className="flex flex-col">
                      <span>{row.productName}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {row.productBarcode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {row.categoryName}
                  </TableCell>
                  <TableCell className="text-center">
                    <AbcBadge value={row.abcClass} />
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {formatUnits(row.quantity)}
                    <span className="ml-1 text-[10px] text-gray-500">
                      {row.unitName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-green-400">
                    {formatMXN(row.sales)}
                    {row.cancelledSubtotal < 0 && (
                      <div className="text-[10px] text-red-400">
                        Cancelaciones: {formatMXN(row.cancelledSubtotal)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {row.daysWithSales}
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {formatUnits(row.avgDailyQuantity)}
                  </TableCell>
                  <TableCell>
                    <DeltaBadge value={row.salesGrowth} suffix="" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-500">
          Clase calculada con todo el catálogo del periodo.
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            color="gray"
            disabled={!hasPrevious}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            size="xs"
            color="gray"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Card>
  );
};

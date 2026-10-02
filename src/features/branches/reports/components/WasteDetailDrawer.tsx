import {
  Alert,
  Badge,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useWasteReport } from "../api/wasteReport.queries";
import { formatDateRange } from "@/utils/date.utils";
import { formatUnits } from "../utils/productMetrics";

interface Props {
  open: boolean;
  onClose: () => void;
  branchIds: number[];
  dates: { start: Date; end: Date };
  scopeLabel: string;
  onSelectProduct: (barcode: string, productName: string) => void;
}

export const WasteDetailDrawer = ({
  open,
  onClose,
  branchIds,
  dates,
  scopeLabel,
  onSelectProduct,
}: Props) => {
  const { data, isLoading, isError } = useWasteReport(
    open,
    branchIds,
    dates.start,
    dates.end,
  );

  const totals = data?.totals;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-full max-w-3xl bg-gray-900"
    >
      <DrawerHeader title="Detalle de merma" />
      <DrawerItems>
        <p className="mb-4 text-sm text-gray-400">
          {scopeLabel} · {formatDateRange(dates.start, dates.end)}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="xl" />
          </div>
        ) : isError || !data || !totals ? (
          <Alert color="failure">
            Ocurrió un error al cargar el detalle de merma.
          </Alert>
        ) : totals.totalQuantity === 0 ? (
          <Alert color="info">
            No hay merma registrada en el periodo seleccionado.
          </Alert>
        ) : (
          <div className="space-y-6 text-gray-100">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Pérdida neta
                </p>
                <p className="text-xl font-bold text-red-400">
                  {formatUnits(totals.lossQuantity)}
                </p>
                <p className="text-[10px] text-gray-500">
                  Merma sin tripa (lo que se pierde)
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Tripa
                </p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatUnits(totals.operationalQuantity)}
                </p>
                <p className="text-[10px] text-gray-500">Merma operativa</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Merma total
                </p>
                <p className="text-xl font-bold text-white">
                  {formatUnits(totals.totalQuantity)}
                </p>
                <p className="text-[10px] text-gray-500">
                  Pérdida neta + tripa
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-md mb-2 font-semibold text-gray-200">
                Por producto
              </h3>
              <div className="overflow-x-auto">
                <Table hoverable className="dark">
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Producto</TableHeadCell>
                      <TableHeadCell className="text-center">
                        Tipo
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Cantidad
                      </TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-gray-700">
                    {data.byProduct.map((product) => (
                      <TableRow
                        key={product.productBarcode}
                        className="cursor-pointer border-gray-700 bg-gray-800"
                        onClick={() =>
                          onSelectProduct(
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
                            <span className="text-[10px] text-gray-500">
                              {product.branchBreakdown
                                .map(
                                  (branch) =>
                                    `${branch.branchName}: ${formatUnits(branch.quantity)}`,
                                )
                                .join(" · ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.tripa ? (
                            <Badge color="warning" size="sm">
                              Tripa (operativa)
                            </Badge>
                          ) : (
                            <Badge color="failure" size="sm">
                              Pérdida neta
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {formatUnits(product.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-md mb-2 font-semibold text-gray-200">
                Por sucursal
              </h3>
              <div className="overflow-x-auto">
                <Table hoverable className="dark">
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Sucursal</TableHeadCell>
                      <TableHeadCell className="text-right">
                        Pérdida neta
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Tripa
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Total
                      </TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-gray-700">
                    {data.byBranch.map((branch) => (
                      <TableRow
                        key={branch.branchId}
                        className="border-gray-700 bg-gray-800"
                      >
                        <TableCell className="font-medium text-white">
                          {branch.branchName}
                        </TableCell>
                        <TableCell className="text-right text-red-400">
                          {formatUnits(branch.lossQuantity)}
                        </TableCell>
                        <TableCell className="text-right text-yellow-400">
                          {formatUnits(branch.tripaQuantity)}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {formatUnits(branch.totalQuantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <p className="text-[10px] text-gray-500">
              Haz clic en un producto para ver su detalle diario por sucursal.
            </p>
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};

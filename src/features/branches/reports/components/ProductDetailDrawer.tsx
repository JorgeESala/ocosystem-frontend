import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Spinner,
} from "flowbite-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProductDetail } from "../api/productAnalytics.queries";
import { formatFullDate, formatWeekdayDayMonth } from "@/utils/date.utils";
import { formatMXN } from "@/utils/moneyNumbers";
import { buildWeekdayAverages, formatUnits } from "../utils/productMetrics";

type Metric = "quantity" | "sales";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

interface Props {
  open: boolean;
  onClose: () => void;
  barcode: string | null;
  branchIds: number[];
  dates: { start: Date; end: Date };
}

export const ProductDetailDrawer = ({
  open,
  onClose,
  barcode,
  branchIds,
  dates,
}: Props) => {
  const [metric, setMetric] = useState<Metric>("quantity");
  const { data, isLoading, isError } = useProductDetail(
    barcode,
    branchIds,
    dates.start,
    dates.end,
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    const byDay = new Map<string, Record<string, number | string>>();
    for (const branch of data.branches) {
      for (const point of branch.daily) {
        const entry = byDay.get(point.day) ?? { day: point.day };
        entry[branch.branchName] =
          ((entry[branch.branchName] as number) ?? 0) +
          (metric === "quantity" ? point.quantity : point.sales);
        byDay.set(point.day, entry);
      }
    }
    return Array.from(byDay.values()).sort((a, b) =>
      String(a.day).localeCompare(String(b.day)),
    );
  }, [data, metric]);

  const weekdayRows = useMemo(
    () =>
      buildWeekdayAverages(
        data?.branches.flatMap((branch) => branch.daily) ?? [],
      ),
    [data],
  );

  const totalQuantity =
    data?.branches.reduce((acc, branch) => acc + branch.quantity, 0) ?? 0;
  const totalSales =
    data?.branches.reduce((acc, branch) => acc + branch.sales, 0) ?? 0;
  const hasCancelledSales =
    data?.branches.some((branch) =>
      branch.daily.some((point) => point.cancelledSubtotal < 0),
    ) ?? false;

  const formatMetric = (value: number) =>
    metric === "sales" ? formatMXN(value) : `${formatUnits(value)} u`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-full max-w-3xl bg-gray-900"
    >
      <DrawerHeader title={data?.productName ?? "Detalle de producto"} />
      <DrawerItems>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="xl" />
          </div>
        ) : isError || !data ? (
          <Alert color="failure">
            Ocurrió un error al cargar el detalle del producto.
          </Alert>
        ) : (
          <div className="space-y-6 text-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="gray">{data.categoryName}</Badge>
              <Badge color="info">Unidad: {data.unitName}</Badge>
              <Badge color="success">Total: {formatUnits(totalQuantity)}</Badge>
              <Badge color="indigo">Venta: {formatMXN(totalSales)}</Badge>
              {hasCancelledSales && (
                <Badge color="failure">Incluye cancelaciones</Badge>
              )}
            </div>

            {(data.variants?.length ?? 0) > 1 && (
              <div>
                <h3 className="text-md font-semibold text-gray-200">
                  Códigos de este producto
                </h3>
                <p className="text-xs text-gray-400">
                  En los reportes se venden como uno; aquí está lo que aporta
                  cada código.
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-left text-xs tracking-wider text-gray-400 uppercase">
                        <th className="py-2">Código</th>
                        <th className="py-2">Nombre</th>
                        <th className="py-2 text-right">Cantidad</th>
                        <th className="py-2 text-right">Venta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {data.variants?.map((variant) => (
                        <tr key={variant.productBarcode}>
                          <td className="py-2 font-mono text-white">
                            {variant.productBarcode}
                            {variant.isCanonical && (
                              <Badge color="success" className="ml-2">
                                canónico
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 text-white">
                            {variant.productName}
                          </td>
                          <td className="py-2 text-right text-white">
                            {formatUnits(variant.quantity)}
                          </td>
                          <td className="py-2 text-right text-green-400">
                            {formatMXN(variant.sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-200">
                Venta diaria por sucursal
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  size="xs"
                  color={metric === "quantity" ? "blue" : "gray"}
                  onClick={() => setMetric("quantity")}
                >
                  Unidades
                </Button>
                <Button
                  size="xs"
                  color={metric === "sales" ? "blue" : "gray"}
                  onClick={() => setMetric("sales")}
                >
                  Venta
                </Button>
              </div>
            </div>

            {data.branches.length === 0 ? (
              <Alert color="info">
                Sin ventas de este producto en el periodo seleccionado.
              </Alert>
            ) : (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        fontSize={11}
                        minTickGap={16}
                        tickFormatter={(value: string) =>
                          formatWeekdayDayMonth(value)
                        }
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickFormatter={(value: number) =>
                          metric === "sales"
                            ? `$${value / 1000}k`
                            : formatUnits(value)
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#F3F4F6" }}
                        labelFormatter={(value) => formatFullDate(value)}
                        formatter={(value: number, name: string) => [
                          formatMetric(value),
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {data.branches.map((branch, index) => (
                        <Line
                          key={branch.branchId}
                          type="monotone"
                          dataKey={branch.branchName}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-md mb-2 font-semibold text-gray-200">
                    Promedio por día de la semana (unidades)
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekdayRows}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value: number) => formatUnits(value)}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(59, 130, 246, 0.12)" }}
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#F3F4F6" }}
                          formatter={(value: number) => [
                            `${formatUnits(value)} u`,
                            "Promedio",
                          ]}
                        />
                        <Bar
                          dataKey="avg"
                          fill="#3B82F6"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-left text-xs tracking-wider text-gray-400 uppercase">
                        <th className="py-2">Sucursal</th>
                        <th className="py-2 text-right">Cantidad</th>
                        <th className="py-2 text-right">Venta real</th>
                        <th className="py-2 text-right">Días con venta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {data.branches.map((branch) => (
                        <tr key={branch.branchId}>
                          <td className="py-2 text-white">
                            {branch.branchName}
                          </td>
                          <td className="py-2 text-right text-white">
                            {formatUnits(branch.quantity)}
                          </td>
                          <td className="py-2 text-right text-green-400">
                            {formatMXN(branch.sales)}
                          </td>
                          <td className="py-2 text-right text-white">
                            {branch.daysWithSales}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </DrawerItems>
    </Drawer>
  );
};

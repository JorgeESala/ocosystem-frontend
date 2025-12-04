import ResponsiveSortableTable from "./ResponsiveTable";
import { BatchCostDetail } from "../services/api";

interface Props {
  batches: BatchCostDetail[];
}
const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);

export default function ProfitBatchTable({ batches }: Props) {
  if (!batches.length) return null;
  const rows = batches.map((b) => ({
    batchId: b.batchId,
    branchName: b.branchName,
    chickenQuantity: b.chickenQuantity,
    avgChickenWeight: Number(b.avgChickenWeight),
    aspKg: Number(b.aspKg),
    quantitySoldInRange: Number(b.quantitySoldInRange),
    kgSoldInRange: Number(b.kgSoldInRange),
    computedCostForRange: Number(b.computedCostForRange),
  }));

  const columns = [
    { key: "batchId", label: "Remesa", sortable: true },
    { key: "branchName", label: "Sucursal", sortable: true },
    { key: "chickenQuantity", label: "Pollos", sortable: true },
    {
      key: "avgChickenWeight",
      label: "Kg/Pollo",
      sortable: true,
      render: (value: number) => formatNumber(value),
    },
    {
      key: "aspKg",
      label: "$/Kg",
      sortable: true,
      render: (value: number) => formatMoney(value),
    },
    { key: "quantitySoldInRange", label: "Vendidos", sortable: true },
    {
      key: "kgSoldInRange",
      label: "Kg Vend.",
      sortable: true,
      render: (value: number) => formatNumber(value),
    },
    {
      key: "computedCostForRange",
      label: "Costo Prop.",
      sortable: true,
      render: (value: number) => formatMoney(value),
    },
  ];
  return (
    <div className="mt-6 rounded-xl bg-gray-800 p-4 text-white shadow">
      <h3 className="mb-3 text-lg font-semibold">Detalle por Remesa</h3>

      <div className="overflow-x-auto">
        <ResponsiveSortableTable columns={columns} data={rows} />
      </div>
    </div>
  );
}

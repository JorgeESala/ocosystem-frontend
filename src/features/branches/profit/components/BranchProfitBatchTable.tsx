import { formatMXN } from "@/utils/moneyNumbers";
import type { BranchProfitBatchDetailDTO } from "../types";
import BranchProfitDataTable from "./BranchProfitDataTable";

interface Props {
  batches: BranchProfitBatchDetailDTO[];
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function BranchProfitBatchTable({ batches }: Props) {
  if (!batches.length) return null;

  const rows = batches.map((batch) => ({
    batchId: batch.batchId,
    branchName: batch.branchName,
    chickenQuantity: batch.chickenQuantity,
    kgSoldInRange: Number(batch.kgSoldInRange),
    totalSalesInRange: Number(batch.totalSalesInRange),
    computedCostForRange: Number(batch.computedCostForRange),
    marginInRange:
      Number(batch.totalSalesInRange) - Number(batch.computedCostForRange),
    aspKg: Number(batch.aspKg),
  }));

  const columns = [
    { key: "batchId", label: "Remesa", sortable: true },
    { key: "branchName", label: "Sucursal", sortable: true },
    { key: "chickenQuantity", label: "Pollos", sortable: true },
    {
      key: "kgSoldInRange",
      label: "Kg vendidos",
      sortable: true,
      render: (value: number) => formatNumber(value),
    },
    {
      key: "totalSalesInRange",
      label: "Ventas en rango",
      sortable: true,
      render: (value: number) => formatMXN(value),
    },
    {
      key: "computedCostForRange",
      label: "Costo prorrateado",
      sortable: true,
      render: (value: number) => formatMXN(value),
    },
    {
      key: "marginInRange",
      label: "Utilidad estimada",
      sortable: true,
      render: (value: number) => (
        <span className={value >= 0 ? "text-emerald-300" : "text-rose-300"}>
          {formatMXN(value)}
        </span>
      ),
    },
    {
      key: "aspKg",
      label: "ASP Kg",
      sortable: true,
      render: (value: number) => formatMXN(value),
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Detalle por remesa
          </h3>
          <p className="text-sm text-slate-400">
            El costo prorrateado y la utilidad estimada ayudan a detectar
            remesas que presionan el margen.
          </p>
        </div>
        <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Ordenable
        </span>
      </div>

      <div className="overflow-x-auto">
        <BranchProfitDataTable columns={columns} data={rows} />
      </div>
    </section>
  );
}

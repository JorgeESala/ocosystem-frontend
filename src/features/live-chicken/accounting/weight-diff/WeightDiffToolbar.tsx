import { useMemo, useState } from "react";
import { Button, Select, Spinner, Tooltip } from "flowbite-react";
import { HiDownload, HiDocumentText, HiTable } from "react-icons/hi";
import {
  downloadWeeklyWeightDiffExcel,
  downloadWeeklyWeightDiffPdf,
  triggerDownload,
} from "./weight-diff.api";
import type { WeeklyWeightDiffRow } from "./types";

interface Props {
  rows: WeeklyWeightDiffRow[];
  startDate: string;
  endDate: string;
  onSupplierChange: (supplierId: number | null) => void;
}

const toDateParam = (value: string): string => {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildFilename = (
  startDate: string,
  endDate: string,
  supplierId: number | null,
  ext: "pdf" | "xlsx",
) => {
  const supplierPart = supplierId == null ? "" : `-prov-${supplierId}`;
  return `diferencia-peso-${toDateParam(startDate)}_${toDateParam(endDate)}${supplierPart}.${ext}`;
};

export const WeightDiffToolbar = ({
  rows,
  startDate,
  endDate,
  onSupplierChange,
}: Props) => {
  const [busyAction, setBusyAction] = useState<"pdf" | "xlsx" | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("ALL");

  const suppliers = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of rows) {
      if (r.supplierId != null && !map.has(r.supplierId)) {
        map.set(r.supplierId, r.supplierName ?? `Proveedor ${r.supplierId}`);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [rows]);

  const handleSupplierChange = (value: string) => {
    setSelectedSupplier(value);
    if (value === "ALL") {
      onSupplierChange(null);
    } else {
      onSupplierChange(Number(value));
    }
  };

  const supplierId = selectedSupplier === "ALL" ? null : Number(selectedSupplier);

  const handleExportPdf = async () => {
    setBusyAction("pdf");
    try {
      const blob = await downloadWeeklyWeightDiffPdf(startDate, endDate, supplierId);
      triggerDownload(blob, buildFilename(startDate, endDate, supplierId, "pdf"));
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportExcel = async () => {
    setBusyAction("xlsx");
    try {
      const blob = await downloadWeeklyWeightDiffExcel(startDate, endDate, supplierId);
      triggerDownload(blob, buildFilename(startDate, endDate, supplierId, "xlsx"));
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
          Proveedor
        </span>
        <Select
          value={selectedSupplier}
          onChange={(e) => handleSupplierChange(e.target.value)}
          className="min-w-[220px]"
        >
          <option value="ALL">Todos los proveedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <Button
        color="gray"
        onClick={handleExportPdf}
        disabled={busyAction !== null || rows.length === 0}
      >
        {busyAction === "pdf" ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <HiDocumentText className="mr-2 h-4 w-4" />
        )}
        Exportar PDF
      </Button>
      <Button
        color="gray"
        onClick={handleExportExcel}
        disabled={busyAction !== null || rows.length === 0}
      >
        {busyAction === "xlsx" ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <HiTable className="mr-2 h-4 w-4" />
        )}
        Exportar Excel
      </Button>
      <Tooltip
        content="Útil para enviar el reporte por correo. Excel respeta los mismos totales que el PDF."
        placement="bottom"
      >
        <button
          type="button"
          aria-label="Ayuda sobre las exportaciones"
          className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <HiDownload className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  );
};

import { useMemo, useState } from "react";
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from "flowbite-react";
import {
  HiChevronDown,
  HiChevronRight,
  HiDocumentText,
  HiSortAscending,
  HiSortDescending,
  HiTable,
} from "react-icons/hi";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import type {
  WeeklyWeightDiffBatchRow,
  WeeklyWeightDiffRow,
} from "./types";
import { useWeeklyWeightDiffBatches } from "./weight-diff.queries";
import {
  downloadWeeklyWeightDiffExcel,
  downloadWeeklyWeightDiffPdf,
  triggerDownload,
} from "./weight-diff.api";

type SortKey =
  | "weekStart"
  | "supplierName"
  | "batchCount"
  | "totalDeclaredWeight"
  | "totalRealWeight"
  | "weightDiff"
  | "monetaryDiff"
  | "weightDiffPct";

type SortDir = "asc" | "desc";

interface Props {
  rows: WeeklyWeightDiffRow[];
  selectedStart?: string;
  selectedEnd?: string;
}

const formatKg = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(n);

const formatInt = (n: number) =>
  new Intl.NumberFormat("es-MX").format(n);

const formatPct = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(n);

const diffColor = (n: number) => {
  if (n > 0.5) return "text-red-400";
  if (n < -0.5) return "text-green-400";
  return "text-gray-300";
};

const compare = (a: number, b: number, dir: SortDir): number => {
  if (Number.isNaN(a)) a = 0;
  if (Number.isNaN(b)) b = 0;
  return dir === "asc" ? a - b : b - a;
};

const compareStr = (a: string, b: string, dir: SortDir): number => {
  const cmp = a.localeCompare(b, "es");
  return dir === "asc" ? cmp : -cmp;
};

const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const isPartialWeek = (
  weekStart: string,
  selectedStart?: string,
  selectedEnd?: string,
): boolean => {
  if (!weekStart || !selectedStart || !selectedEnd) return false;
  return weekStart < selectedStart || addDays(weekStart, 6) > selectedEnd;
};

const PARTIAL_WEEK_TOOLTIP =
  "Datos parciales: el rango seleccionado no cubre toda esta semana (lunes a domingo). Los kilos y pesos mostrados corresponden solo a los dias incluidos en el rango.";

const rowKey = (r: WeeklyWeightDiffRow) =>
  `${r.supplierId ?? "x"}__${r.weekStart ?? "x"}`;

const BatchSubTable = ({
  weekStart,
  supplierId,
}: {
  weekStart: string;
  supplierId: number | null;
}) => {
  const { data, isLoading, isError } = useWeeklyWeightDiffBatches(
    weekStart,
    supplierId,
    true,
  );

  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  const handleExport = async (kind: "pdf" | "xlsx") => {
    setExporting(kind);
    try {
      const start = weekStart;
      const end = addDays(weekStart, 6);
      const blob =
        kind === "pdf"
          ? await downloadWeeklyWeightDiffPdf(start, end, supplierId)
          : await downloadWeeklyWeightDiffExcel(start, end, supplierId);
      const ext = kind;
      const supplierPart = supplierId == null ? "" : `-prov-${supplierId}`;
      const filename = `diferencia-peso-${start}_semana${supplierPart}.${ext}`;
      triggerDownload(blob, filename);
    } finally {
      setExporting(null);
    }
  };

  const totals = useMemo(() => {
    if (!data) return null;
    const sums = data.reduce(
      (acc, r) => ({
        birds: acc.birds + (Number(r.chickenQuantity) || 0),
        declared: acc.declared + (r.declaredWeight ?? 0),
        real: acc.real + (r.realWeight ?? 0),
        diff: acc.diff + (r.weightDiff ?? 0),
        monetary: acc.monetary + (r.monetaryDiff ?? 0),
      }),
      { birds: 0, declared: 0, real: 0, diff: 0, monetary: 0 },
    );
    const weightedPrice =
      sums.declared > 0
        ? data.reduce(
            (acc, r) => acc + (r.pricePerKg ?? 0) * (r.declaredWeight ?? 0),
            0,
          ) / sums.declared
        : 0;
    const weightedPct =
      sums.declared > 0 ? (sums.diff / sums.declared) * 100 : 0;
    return { ...sums, weightedPrice, weightedPct };
  }, [data]);

  return (
    <div className="border-l-2 border-cyan-700 bg-gray-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
          Remesas de la semana
        </span>
        <div className="flex items-center gap-1">
          <Tooltip content="Exportar solo esta semana (PDF)">
            <Button
              size="xs"
              color="gray"
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null || isLoading || !data || data.length === 0}
            >
              {exporting === "pdf" ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <HiDocumentText className="mr-1 h-3.5 w-3.5" />
              )}
              PDF
            </Button>
          </Tooltip>
          <Tooltip content="Exportar solo esta semana (Excel)">
            <Button
              size="xs"
              color="gray"
              onClick={() => handleExport("xlsx")}
              disabled={exporting !== null || isLoading || !data || data.length === 0}
            >
              {exporting === "xlsx" ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <HiTable className="mr-1 h-3.5 w-3.5" />
              )}
              Excel
            </Button>
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 p-4 text-xs text-gray-400">
          <Spinner size="sm" /> Cargando remesas...
        </div>
      ) : isError ? (
        <p className="p-4 text-xs text-red-400">
          No se pudieron cargar las remesas de esta semana.
        </p>
      ) : !data || data.length === 0 ? (
        <p className="p-4 text-xs text-gray-500 italic">
          No hay remesas con datos completos en esta semana.
        </p>
      ) : (
        <Table className="text-xs">
          <TableHead>
            <TableRow>
              <TableHeadCell>Fecha</TableHeadCell>
              <TableHeadCell className="text-right">Aves</TableHeadCell>
              <TableHeadCell className="text-right">Precio / kg</TableHeadCell>
              <TableHeadCell className="text-right">Decl. (kg)</TableHeadCell>
              <TableHeadCell className="text-right">Real (kg)</TableHeadCell>
              <TableHeadCell className="text-right">Dif. (kg)</TableHeadCell>
              <TableHeadCell className="text-right">Dif. ($)</TableHeadCell>
              <TableHeadCell className="text-right">Dif. (%)</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((b: WeeklyWeightDiffBatchRow) => (
              <TableRow key={b.batchId} className="border-t border-gray-800">
                <TableCell className="whitespace-nowrap text-gray-200">
                  {b.entryDate ? formatHumanDate(b.entryDate, "long") : "—"}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatInt(Number(b.chickenQuantity) || 0)}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatKg(b.pricePerKg ?? 0)}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatKg(b.declaredWeight ?? 0)}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatKg(b.realWeight ?? 0)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${diffColor(b.weightDiff ?? 0)}`}
                >
                  {formatKg(b.weightDiff ?? 0)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${diffColor(b.monetaryDiff ?? 0)}`}
                >
                  {formatMXN(b.monetaryDiff ?? 0)}
                </TableCell>
                <TableCell
                  className={`text-right ${diffColor(b.weightDiffPct ?? 0)}`}
                >
                  {formatPct(b.weightDiffPct ?? 0)}%
                </TableCell>
              </TableRow>
            ))}
            {totals && (
              <TableRow className="border-t-2 border-gray-600 bg-gray-800/60 font-semibold">
                <TableCell className="uppercase text-white">Total</TableCell>
                <TableCell className="text-right text-white">
                  {formatInt(totals.birds)}
                </TableCell>
                <TableCell className="text-right text-white">
                  {formatKg(totals.weightedPrice)}
                </TableCell>
                <TableCell className="text-right text-white">
                  {formatKg(totals.declared)}
                </TableCell>
                <TableCell className="text-right text-white">
                  {formatKg(totals.real)}
                </TableCell>
                <TableCell
                  className={`text-right ${diffColor(totals.diff)}`}
                >
                  {formatKg(totals.diff)}
                </TableCell>
                <TableCell
                  className={`text-right ${diffColor(totals.monetary)}`}
                >
                  {formatMXN(totals.monetary)}
                </TableCell>
                <TableCell
                  className={`text-right ${diffColor(totals.weightedPct)}`}
                >
                  {formatPct(totals.weightedPct)}%
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export const WeeklyWeightDiffTable = ({
  rows,
  selectedStart,
  selectedEnd,
}: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("supplierName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (r: WeeklyWeightDiffRow) => {
    const key = rowKey(r);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let primary = 0;
      switch (sortKey) {
        case "weekStart":
          primary = compareStr(a.weekStart ?? "", b.weekStart ?? "", sortDir);
          break;
        case "supplierName":
          primary = compareStr(
            a.supplierName ?? "",
            b.supplierName ?? "",
            sortDir,
          );
          break;
        case "batchCount":
          primary = compare(a.batchCount ?? 0, b.batchCount ?? 0, sortDir);
          break;
        case "totalDeclaredWeight":
          primary = compare(
            a.totalDeclaredWeight ?? 0,
            b.totalDeclaredWeight ?? 0,
            sortDir,
          );
          break;
        case "totalRealWeight":
          primary = compare(
            a.totalRealWeight ?? 0,
            b.totalRealWeight ?? 0,
            sortDir,
          );
          break;
        case "weightDiff":
          primary = compare(a.weightDiff ?? 0, b.weightDiff ?? 0, sortDir);
          break;
        case "monetaryDiff":
          primary = compare(
            a.monetaryDiff ?? 0,
            b.monetaryDiff ?? 0,
            sortDir,
          );
          break;
        case "weightDiffPct":
          primary = compare(
            a.weightDiffPct ?? 0,
            b.weightDiffPct ?? 0,
            sortDir,
          );
          break;
      }
      if (primary !== 0) return primary;
      return compareStr(a.supplierName ?? "", b.supplierName ?? "", "asc");
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totals = useMemo(() => {
    const sums = sorted.reduce(
      (acc, r) => ({
        declared: acc.declared + (r.totalDeclaredWeight ?? 0),
        real: acc.real + (r.totalRealWeight ?? 0),
        diff: acc.diff + (r.weightDiff ?? 0),
        monetary: acc.monetary + (r.monetaryDiff ?? 0),
        count: acc.count + (r.batchCount ?? 0),
      }),
      { declared: 0, real: 0, diff: 0, monetary: 0, count: 0 },
    );
    const weightedPct =
      sums.declared > 0 ? (sums.diff / sums.declared) * 100 : 0;
    return { ...sums, weightedPct };
  }, [sorted]);

  if (rows.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-gray-400">
        No hay remesas con peso declarado y real en el rango seleccionado.
      </p>
    );
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      if (key === "supplierName" || key === "weekStart") {
        setSortDir("asc");
      } else {
        setSortDir("desc");
      }
    }
  };

  const SortHeader = ({
    k,
    label,
    align = "left",
  }: {
    k: SortKey;
    label: string;
    align?: "left" | "right";
  }) => (
    <button
      type="button"
      onClick={() => handleSort(k)}
      className={`inline-flex items-center gap-1 text-xs font-medium uppercase text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 ${align === "right" ? "ml-auto" : ""}`}
    >
      {label}
      {sortKey === k ? (
        sortDir === "desc" ? (
          <HiSortDescending className="h-3.5 w-3.5" />
        ) : (
          <HiSortAscending className="h-3.5 w-3.5" />
        )
      ) : null}
    </button>
  );

  let lastSupplierId: number | null = null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <Table className="min-w-full text-sm">
        <TableHead className="sticky top-0 z-10 bg-gray-900 text-xs">
          <TableRow>
            <TableHeadCell className="w-8"></TableHeadCell>
            <TableHeadCell>
              <SortHeader k="weekStart" label="Semana" />
            </TableHeadCell>
            <TableHeadCell>
              <SortHeader k="supplierName" label="Proveedor" />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader k="batchCount" label="Remesas" align="right" />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader
                k="totalDeclaredWeight"
                label="Decl. (kg)"
                align="right"
              />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader
                k="totalRealWeight"
                label="Real (kg)"
                align="right"
              />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader k="weightDiff" label="Dif. (kg)" align="right" />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader k="monetaryDiff" label="Dif. ($)" align="right" />
            </TableHeadCell>
            <TableHeadCell className="text-right">
              <SortHeader k="weightDiffPct" label="Dif. (%)" align="right" />
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r, i) => {
            const isFirstOfGroup = r.supplierId !== lastSupplierId;
            lastSupplierId = r.supplierId ?? null;
            const partial = isPartialWeek(
              r.weekStart ?? "",
              selectedStart,
              selectedEnd,
            );
            const key = rowKey(r);
            const isExpanded = expanded.has(key);
            return (
              <>
                <TableRow
                  key={`row-${key}-${i}`}
                  className={`cursor-pointer ${
                    isFirstOfGroup
                      ? "border-t-2 border-gray-700 bg-gray-800/30"
                      : "border-t border-gray-800"
                  } ${isExpanded ? "bg-gray-800/60" : ""}`}
                  onClick={() => toggleExpanded(r)}
                >
                  <TableCell className="w-8 text-gray-400">
                    {isExpanded ? (
                      <HiChevronDown className="h-4 w-4" />
                    ) : (
                      <HiChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-200">
                    {r.weekStart
                      ? formatHumanDate(r.weekStart, "long")
                      : "—"}
                    {partial && (
                      <Tooltip
                        content={PARTIAL_WEEK_TOOLTIP}
                        placement="top"
                      >
                        <span className="ml-2 cursor-help rounded bg-yellow-900/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-yellow-300 uppercase">
                          Datos parciales
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {r.supplierName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-gray-300">
                    {r.batchCount ?? 0}
                  </TableCell>
                  <TableCell className="text-right text-gray-300">
                    {formatKg(r.totalDeclaredWeight ?? 0)}
                  </TableCell>
                  <TableCell className="text-right text-gray-300">
                    {formatKg(r.totalRealWeight ?? 0)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${diffColor(r.weightDiff ?? 0)}`}
                  >
                    {formatKg(r.weightDiff ?? 0)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${diffColor(r.monetaryDiff ?? 0)}`}
                  >
                    {formatMXN(r.monetaryDiff ?? 0)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${diffColor(r.weightDiffPct ?? 0)}`}
                  >
                    {formatPct(r.weightDiffPct ?? 0)}%
                  </TableCell>
                </TableRow>
                {isExpanded && r.weekStart && (
                  <TableRow
                    key={`sub-${key}-${i}`}
                    className="border-0 bg-gray-900/40"
                  >
                    <TableCell colSpan={9} className="p-0">
                      <BatchSubTable
                        weekStart={r.weekStart}
                        supplierId={r.supplierId ?? null}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
          <TableRow className="border-t-2 border-gray-600 bg-gray-900/80 font-semibold">
            <TableCell></TableCell>
            <TableCell className="uppercase text-white">Total</TableCell>
            <TableCell className="text-white">—</TableCell>
            <TableCell className="text-right text-white">
              {totals.count}
            </TableCell>
            <TableCell className="text-right text-white">
              {formatKg(totals.declared)}
            </TableCell>
            <TableCell className="text-right text-white">
              {formatKg(totals.real)}
            </TableCell>
            <TableCell
              className={`text-right ${diffColor(totals.diff)}`}
            >
              {formatKg(totals.diff)}
            </TableCell>
            <TableCell
              className={`text-right ${diffColor(totals.monetary)}`}
            >
              {formatMXN(totals.monetary)}
            </TableCell>
            <TableCell
              className={`text-right ${diffColor(totals.weightedPct)}`}
            >
              {formatPct(totals.weightedPct)}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

import { useState, useEffect } from "react";
import {
  Datepicker,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  HiScale,
  HiArrowTrendingDown,
  HiArrowTrendingUp,
} from "react-icons/hi2";
import { getMermaReport } from "../../api/batch.api";
import type { MermaReport, MermaBatchDetail } from "../../types.batch";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import { fetchBranches, type Branch } from "@/services/api";

const MERMA_THRESHOLDS = {
  conTripa: { green: 240, yellow: 300 },
  sinTripa: { green: 180, yellow: 240 },
} as const;

function getMermaColor(grams: number, target: "conTripa" | "sinTripa"): string {
  const t = MERMA_THRESHOLDS[target];
  if (grams <= t.green) return "text-green-400";
  if (grams <= t.yellow) return "text-yellow-400";
  return "text-red-400";
}

function getMermaBgColor(grams: number, target: "conTripa" | "sinTripa"): string {
  const t = MERMA_THRESHOLDS[target];
  if (grams <= t.green) return "bg-green-900/30 text-green-400";
  if (grams <= t.yellow) return "bg-yellow-900/30 text-yellow-400";
  return "bg-red-900/30 text-red-400";
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border-none bg-gray-800 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium tracking-wider text-gray-400 uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${colorClass}`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}

export default function MermaComparison() {
  const [report, setReport] = useState<MermaReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [trainingDate, setTrainingDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem("mermaTrainingDate");
    if (stored) {
      const d = new Date(stored);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  });

  useEffect(() => {
    if (trainingDate) {
      localStorage.setItem("mermaTrainingDate", trainingDate.toISOString());
    }
  }, [trainingDate]);

  useEffect(() => {
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
  }, []);

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];
      const trainStr = trainingDate
        ? trainingDate.toISOString().split("T")[0]
        : undefined;
      const data = await getMermaReport(
        startStr,
        endStr,
        trainStr,
        selectedBranches.length > 0 ? selectedBranches : undefined,
      );
      setReport(data);
    } catch (err) {
      console.error("Error fetching merma report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const before = report?.before;
  const after = report?.after;

  const chartData =
    before && after
      ? [
          {
            name: "Antes",
            "Merma (g/ave)": before.avgMermaGramsPerChicken,
            "Merma con tripa (g/ave)": Math.round(
              before.avgMermaConTripa * 1000,
            ),
          },
          {
            name: "Despues",
            "Merma (g/ave)": after.avgMermaGramsPerChicken,
            "Merma con tripa (g/ave)": Math.round(
              after.avgMermaConTripa * 1000,
            ),
          },
        ]
      : [];

  const sortedBatches = report?.batches
    ? [...report.batches].sort(
        (a, b) => b.mermaGramsPerChicken - a.mermaGramsPerChicken,
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-60">
          <BranchMultiSelect
            branches={branches}
            selected={selectedBranches}
            onChange={setSelectedBranches}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Desde</label>
          <Datepicker
            language="es-MX"
            value={startDate}
            onChange={(d) => d && setStartDate(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Hasta</label>
          <Datepicker
            language="es-MX"
            value={endDate}
            onChange={(d) => d && setEndDate(d)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">
            Fecha de capacitación
          </label>
          <Datepicker
            language="es-MX"
            value={trainingDate ?? undefined}
            onChange={(d) => setTrainingDate(d ?? null)}
          />
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Consultar"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Merma antes"
              value={`${before?.avgMermaGramsPerChicken ?? 0} g/ave`}
              subtitle={`${before?.totalBatches ?? 0} remesas · ${before?.totalChickensReceived ?? 0} aves`}
              icon={HiScale}
              colorClass={getMermaBgColor(before?.avgMermaGramsPerChicken ?? 0, "conTripa")}
            />
            <KpiCard
              title="Merma despues"
              value={`${after?.avgMermaGramsPerChicken ?? 0} g/ave`}
              subtitle={`${after?.totalBatches ?? 0} remesas · ${after?.totalChickensReceived ?? 0} aves`}
              icon={HiScale}
              colorClass={getMermaBgColor(after?.avgMermaGramsPerChicken ?? 0, "conTripa")}
            />
            <KpiCard
              title="Total merma"
              value={`${((before?.totalMermaKg ?? 0) + (after?.totalMermaKg ?? 0)).toFixed(1)} kg`}
              subtitle={` ${((before?.mermaPct ?? 0) + (after?.mermaPct ?? 0)).toFixed(1)}% promedio`}
              icon={HiArrowTrendingDown}
              colorClass="bg-orange-900/30 text-orange-400"
            />
            <KpiCard
              title="Diferencia"
              value={
                before && after
                  ? `${(before.avgMermaGramsPerChicken - after.avgMermaGramsPerChicken).toFixed(0)} g`
                  : "—"
              }
              subtitle={
                before &&
                after &&
                before.avgMermaGramsPerChicken > after.avgMermaGramsPerChicken
                  ? "Mejora"
                  : before && after
                    ? "Empeora"
                    : ""
              }
              icon={
                before &&
                after &&
                before.avgMermaGramsPerChicken > after.avgMermaGramsPerChicken
                  ? HiArrowTrendingDown
                  : HiArrowTrendingUp
              }
              colorClass={
                before &&
                after &&
                before.avgMermaGramsPerChicken > after.avgMermaGramsPerChicken
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }
            />
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl bg-gray-800 p-4 shadow-lg">
              <h3 className="mb-4 text-sm font-medium text-gray-400 uppercase">
                Comparativa antes / despues del entrenamiento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Merma (g/ave)"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Merma con tripa (g/ave)"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {sortedBatches.length > 0 && (
            <div className="rounded-xl bg-gray-800 p-4 shadow-lg">
              <h3 className="mb-4 text-sm font-medium text-gray-400 uppercase">
                Desglose por remesa
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Remesa</TableHeadCell>
                      <TableHeadCell>Proveedor</TableHeadCell>
                      <TableHeadCell>Fecha</TableHeadCell>
                      <TableHeadCell className="text-right">
                        Pollos
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Recibido (kg)
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Vendido (kg)
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Tripa (kg)
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Merma (g/ave)
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Con tripa (g/ave)
                      </TableHeadCell>
                      <TableHeadCell className="text-right">
                        Sin tripa (g/ave)
                      </TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-gray-700">
                    {sortedBatches.map((b: MermaBatchDetail) => (
                      <TableRow key={b.batchId} className="text-gray-300">
                        <TableCell>#{b.batchId}</TableCell>
                        <TableCell>{b.supplierName}</TableCell>
                        <TableCell>
                          {new Date(
                            `${b.entryDate}T00:00:00`,
                          ).toLocaleDateString("es-MX")}
                        </TableCell>
                        <TableCell className="text-right">
                          {b.chickensReceived}
                        </TableCell>
                        <TableCell className="text-right">
                          {b.weightReceived.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {b.weightSold.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {b.totalKgGut.toFixed(1)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${getMermaColor(b.mermaGramsPerChicken, "conTripa")}`}
                        >
                          {b.mermaGramsPerChicken.toFixed(0)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${getMermaColor(Math.round(b.mermaConTripa * 1000), "conTripa")}`}
                        >
                          {Math.round(b.mermaConTripa * 1000)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${getMermaColor(Math.round(b.mermaSinTripa * 1000), "sinTripa")}`}
                        >
                          {Math.round(b.mermaSinTripa * 1000)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

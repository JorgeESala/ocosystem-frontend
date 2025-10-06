import { useEffect, useState } from "react";
import { Card, Select, Label, Spinner } from "flowbite-react";
import { Bar } from "react-chartjs-2";
import {
  fetchBranches,
  fetchCategories,
  fetchMonthlyCategoryReportWithWeeks,
  Branch,
  Category,
  MonthlyCategoryReport,
  WeeklyReport,
  type MonthlyReport,
  fetchMonthlyReport,
} from "../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
// ...imports y ChartJS como antes

export default function Dashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    number | "all" | null
  >(null);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [report, setReport] = useState<
    MonthlyCategoryReport | MonthlyReport | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Obtener sucursales y categorías
  useEffect(() => {
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
    fetchCategories().then((data) =>
      setCategories(Array.isArray(data) ? data : []),
    );
  }, []);

  // Obtener reporte cuando cambian filtros
  useEffect(() => {
    if (!selectedBranch) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        let data;
        if (selectedCategory === "all" || selectedCategory === null) {
          data = await fetchMonthlyReport(
            selectedBranch,
            selectedYear,
            selectedMonth,
          );
        } else {
          data = await fetchMonthlyCategoryReportWithWeeks(
            selectedBranch,
            selectedCategory,
            selectedYear,
            selectedMonth,
          );
        }
        setReport(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch, selectedCategory, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6 p-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div>
          <Label htmlFor="branch">Sucursal</Label>
          <Select
            id="branch"
            value={selectedBranch || ""}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
          >
            <option value="">Selecciona sucursal</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <Select
            id="category"
            value={selectedCategory ?? "all"}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="month">Mes</Label>
          <Select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="year">Año</Label>
          <Select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={2023 + i}>
                {2023 + i}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {/* Totales y gráfico */}
      {report && !loading && (
        <>
          {/* Totales */}
          <div className="grid grid-cols-1 gap-4 text-white sm:grid-cols-2 md:grid-cols-4">
            <Card>Ventas: ${Number(report.totalSales ?? 0).toFixed(2)}</Card>
            <Card>Gastos: ${Number(report.totalExpenses ?? 0).toFixed(2)}</Card>
            <Card>Utilidad: ${Number(report.totalProfit ?? 0).toFixed(2)}</Card>
            {"totalSold" in report && (
              <Card>
                Cantidad Vendida: {Number(report.totalSold ?? 0).toFixed(2)} kg
              </Card>
            )}
            {"totalBought" in report && (
              <Card>
                Cantidad Comprada: {Number(report.totalBought ?? 0).toFixed(2)}{" "}
                kg
              </Card>
            )}
            {"waste" in report && report.waste !== undefined && (
              <Card className="bg-red-500 font-semibold text-white">
                Merma: {Number(report.waste ?? 0).toFixed(2)} kg
              </Card>
            )}
          </div>

          {/* Gráfico semanal */}
          <div className="mt-6">
            <Bar
              data={{
                labels:
                  report.weeklyReports?.map((w) =>
                    new Date(w.weekStart).toLocaleDateString(),
                  ) || [],
                datasets: [
                  {
                    label: "Ventas",
                    data: report.weeklyReports?.map((w) => w.totalSales) || [],
                    backgroundColor: "rgba(34,197,94,0.7)",
                  },
                  {
                    label: "Gastos",
                    data:
                      report.weeklyReports?.map((w) => w.totalExpenses) || [],
                    backgroundColor: "rgba(239,68,68,0.7)",
                  },
                  {
                    label: "Utilidad",
                    data: report.weeklyReports?.map((w) => w.profit) || [],
                    backgroundColor: "rgba(59,130,246,0.7)",
                  },
                ],
              }}
            />
          </div>
          {/* Tabla semanal */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="px-4 py-2">Semana</th>
                  <th className="px-4 py-2">Ventas</th>
                  <th className="px-4 py-2">Gastos</th>
                  <th className="px-4 py-2">Utilidad</th>
                  <th className="px-4 py-2">Cantidad Vendida</th>
                  <th className="px-4 py-2">Cantidad Comprada</th>
                </tr>
              </thead>
              <tbody>
                {report.weeklyReports?.map((w, idx) => (
                  <tr key={idx} className="border-t text-center text-white">
                    <td className="px-4 py-2">
                      {new Date(w.weekStart).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      ${Number(w.totalSales ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      ${Number(w.totalExpenses ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      ${Number(w.profit ?? 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-2">
                      {Number(w.totalSold ?? 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-2">
                      {Number(w.totalBought ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desglose */}
          <div className="mt-6 grid grid-cols-1 gap-6 text-white sm:grid-cols-2 md:grid-cols-3">
            {"salesByCategory" in report && (
              <Card className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-lg font-bold">Ventas por Categoría</h2>
                <ul>
                  {Object.entries(report.salesByCategory || {}).map(
                    ([cat, total]) => (
                      <li key={cat} className="flex justify-between">
                        <span>{cat}</span>
                        <span>${Number(total).toFixed(2)}</span>
                      </li>
                    ),
                  )}
                </ul>
              </Card>
            )}

            {"expensesByCategory" in report && (
              <Card className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-lg font-bold">Gastos por Categoría</h2>
                <ul>
                  {Object.entries(report.expensesByCategory || {}).map(
                    ([cat, total]) => (
                      <li key={cat} className="flex justify-between">
                        <span>{cat}</span>
                        <span>${Number(total).toFixed(2)}</span>
                      </li>
                    ),
                  )}
                </ul>
              </Card>
            )}

            {"salesByProduct" in report && (
              <Card className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-lg font-bold">Ventas por Producto</h2>
                <ul>
                  {Object.entries(
                    Array.isArray(report.salesByProduct)
                      ? Object.assign({}, ...report.salesByProduct)
                      : report.salesByProduct || {},
                  ).map(([prod, total]) => (
                    <li key={prod} className="flex justify-between">
                      <span>{prod}</span>
                      <span>${Number(total).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {"quantitiesByProduct" in report && (
              <Card className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-lg font-bold">
                  Cantidad Vendida por Producto
                </h2>
                <ul>
                  {Object.entries(
                    Array.isArray(report.quantitiesByProduct)
                      ? Object.assign({}, ...report.quantitiesByProduct)
                      : report.quantitiesByProduct || {},
                  ).map(([prod, qty]) => (
                    <li key={prod} className="flex justify-between">
                      <span>{prod}</span>
                      <span>{Number(qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Mensaje si no hay reporte */}
      {!report && !loading && selectedBranch && (
        <div className="mt-6 text-center text-gray-500">
          No hay datos para la selección actual.
        </div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Checkbox,
  Datepicker,
  Dropdown,
  Select,
  ToggleSwitch,
} from "flowbite-react";
import {
  Branch,
  fetchBranches,
  Category,
  fetchCategories,
  fetchComparisonData,
  Frequency,
  ReportEntry,
} from "../services/api";

export default function ComparisonsGraphs() {
  const [frequency, setFrequency] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [metric, setMetric] = useState<"sales" | "quantity">("sales");
  const [isContinuous, setIsContinuous] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [chartData, setChartData] = useState<Record<string, number | string>[]>(
    [],
  );
  const [reports, setReports] = useState<ReportEntry[]>([]);

  type GenerateChartDataParams = {
    selectedBranches: number[];
    selectedCategories: number[];
    startDate: Date | null;
    endDate: Date | null;
    frequency: Frequency;
    isContinuous: boolean;
    metric: "sales" | "quantity";
    setChartData: (data: any[]) => void;
    branches: { id: number; name: string }[];
    categories: { id: number; name: string }[];
  };

  const generateChartData = async function ({
    selectedBranches,
    selectedCategories,
    startDate,
    endDate,
    frequency,
    isContinuous,
    metric,
    setChartData,
    branches,
    categories,
  }: GenerateChartDataParams) {
    // 1️⃣ Validación básica
    if (selectedBranches.length === 0 || !startDate || !endDate) {
      setChartData([]);
      return;
    }

    // 2️⃣ Armar el request base
    const request = {
      branchIds: selectedBranches,
      startDate,
      endDate,
      frequency,
    };

    // 4️⃣ Si la vista es continua: mostrar líneas sucursal-categoría o totales
    if (isContinuous) {
      const fetchedReports = await fetchComparisonData(request);
      // 3️⃣ Obtener los reportes
      setReports(fetchedReports);
      const chartMap: Record<string, any> = {};

      fetchedReports.forEach((r) => {
        const date = r.startDate.split("T")[0];
        if (!chartMap[date]) chartMap[date] = { date };

        const branchName =
          branches.find((b) => b.id === r.branchId)?.name ??
          `Sucursal ${r.branchId}`;

        if (selectedCategories.length === 0) {
          // No hay categorías seleccionadas → usar total general por sucursal
          const key = branchName;
          const value = metric === "sales" ? r.totalSales : r.totalSold;
          chartMap[date][key] = value;
        } else {
          // Hay categorías seleccionadas → crear línea por sucursal-categoría
          const source =
            metric === "sales" ? r.salesByCategory : r.quantitiesByCategory;

          selectedCategories.forEach((categoryId) => {
            const categoryName =
              categories.find((c) => c.id === categoryId)?.name ?? "";
            const key = `${branchName} - ${categoryName}`;
            const value = source[categoryName] ?? 0;
            chartMap[date][key] = value;
          });
        }
      });

      const formatted = Object.values(chartMap).sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setChartData(formatted);
      return;
    }

    // 5️⃣ Vista NO continua (comparar sucursales consigo mismas)
    const innerFrequency: Frequency =
      frequency === "weekly"
        ? "daily"
        : frequency === "monthly"
          ? "weekly"
          : frequency === "yearly"
            ? "monthly"
            : frequency;

    const innerRequest = {
      branchIds: selectedBranches,
      startDate,
      endDate,
      frequency: innerFrequency,
    };

    // Petición más detallada (por día, semana o mes)
    const fetchedReports = await fetchComparisonData(innerRequest);
    // 3️⃣ Obtener los reportes
    setReports(fetchedReports);
    console.log(reports);
    // Map para agrupar por punto del eje X -> { "Semana 1": { "Roneli - Julio": 1000, ... } }
    const chartMap: Record<string, Record<string, number>> = {};

    // Función auxiliar: nombre del día
    const getDayName = (isoDate: string): string => {
      const days = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const d = new Date(isoDate);
      return days[d.getDay()];
    };

    // Función auxiliar: semana del mes
    const getWeekOfMonth = (isoDate: string): string => {
      const d = new Date(isoDate);
      const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const firstWeekday = firstDayOfMonth.getDay(); // domingo = 0
      const adjustedDay = d.getDate() + firstWeekday;
      const weekOfMonth = Math.ceil(adjustedDay / 7);
      return `Semana ${weekOfMonth}`;
    };

    // Recorremos todos los reportes detallados
    fetchedReports.forEach((r) => {
      const branchName =
        branches.find((b) => b.id === r.branchId)?.name ??
        `Sucursal ${r.branchId}`;

      // Clave de grupo: ej. "Roneli - Julio"
      const groupKey = makeGroupKey(r.startDate, frequency, branchName);

      // Etiqueta del punto en el eje X
      let pointLabel: string;
      if (frequency === "monthly") {
        pointLabel = getWeekOfMonth(r.startDate);
      } else if (frequency === "weekly") {
        pointLabel = getDayName(r.startDate);
      } else {
        pointLabel = r.startDate.split("T")[0]; // diaria u otra
      }

      const source =
        metric === "sales" ? r.salesByCategory : r.quantitiesByCategory;

      // Inicializar fila si no existe
      if (!chartMap[pointLabel]) chartMap[pointLabel] = {};

      // Total según categorías seleccionadas
      let total: number;
      if (selectedCategories.length === 0) {
        total = metric === "sales" ? r.totalSales : r.totalSold;
      } else {
        total = 0;
        selectedCategories.forEach((catId) => {
          const categoryName =
            categories.find((c) => c.id === catId)?.name ?? "";
          total += source[categoryName] ?? 0;
        });
      }

      // Guardar total bajo la clave del grupo
      chartMap[pointLabel][groupKey] = total;
    });

    // Convertimos chartMap a arreglo
    const formatted = Object.entries(chartMap).map(([date, values]) => ({
      date,
      ...values,
    }));

    // Ordenamos eje X
    if (frequency === "weekly") {
      const order = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      formatted.sort((a, b) => order.indexOf(a.date) - order.indexOf(b.date));
    } else if (frequency === "monthly") {
      formatted.sort(
        (a, b) =>
          parseInt(a.date.replace("Semana ", "")) -
          parseInt(b.date.replace("Semana ", "")),
      );
    }

    setChartData(formatted);
  };

  // 🧩 Utilidad: genera el nombre del grupo según la frecuencia
  function makeGroupKey(
    dateStr: string,
    frequency: Frequency,
    branchName: string,
  ) {
    const date = new Date(dateStr);
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    let week;
    switch (frequency) {
      case "weekly":
        // Semana del año aproximada
        week = Math.ceil(
          ((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) /
            86400000 +
            new Date(date.getFullYear(), 0, 1).getDay() +
            1) /
            7,
        );
        return `${branchName} - Semana ${week}`;
      case "monthly":
        return `${branchName} - ${monthNames[date.getMonth()]}`;
      case "yearly":
        return `${branchName} - ${date.getFullYear()}`;
      default:
        return `${branchName} - ${dateStr}`;
    }
  }

  // Cargar sucursales y categorías
  useEffect(() => {
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
    fetchCategories().then((data) =>
      setCategories(Array.isArray(data) ? data : []),
    );
  }, []);

  const toggleBranch = (id: number) => {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };
  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // Filtrar por categorías y calcular el valor a graficar según metric
  useEffect(() => {
    generateChartData({
      selectedBranches,
      selectedCategories,
      startDate,
      endDate,
      frequency,
      isContinuous,
      metric,
      setChartData,
      branches,
      categories,
    });
  }, [
    selectedBranches,
    selectedCategories,
    startDate,
    endDate,
    frequency,
    isContinuous,
    metric,
  ]);

  useEffect(() => {
    if (chartData.length > 0) {
      setKeys(Object.keys(chartData[0]).filter((k) => k !== "date"));
    }
  }, [chartData]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-center text-xl font-semibold">Comparaciones</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Select
          id="periods"
          className="bg-indigo"
          value={frequency}
          onChange={(e) =>
            setFrequency(
              e.target.value as
                | "hourly"
                | "daily"
                | "weekly"
                | "monthly"
                | "yearly",
            )
          }
        >
          <option value="hourly" disabled>
            Por hora
          </option>
          <option disabled={!isContinuous} value="daily">
            Diario
          </option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </Select>

        <Dropdown
          className="!rounded-lg !border !border-gray-700 !bg-gray-700 !text-gray-100 !shadow-sm focus:!ring-2 focus:!ring-blue-500"
          dismissOnClick={false}
          label="Sucursales"
        >
          {branches.map((branch) => (
            <div key={branch.id} className="px-1 py-1">
              <label className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 select-none hover:bg-gray-100 dark:hover:bg-gray-700">
                <Checkbox
                  checked={selectedBranches.includes(branch.id)}
                  onChange={() => toggleBranch(branch.id)}
                />
                <span>{branch.name}</span>
              </label>
            </div>
          ))}
        </Dropdown>

        <Dropdown
          className="!rounded-lg !border !border-gray-700 !bg-gray-700 !text-gray-100 !shadow-sm focus:!ring-2 focus:!ring-blue-500"
          dismissOnClick={false}
          label="Categorías"
        >
          {categories.map((category) => (
            <div key={category.id} className="px-1 py-1">
              <label className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 select-none hover:bg-gray-100 dark:hover:bg-gray-700">
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                <span>{category.name}</span>
              </label>
            </div>
          ))}
        </Dropdown>

        <Select
          id="indicator"
          className="bg-indigo"
          value={metric}
          onChange={(e) => setMetric(e.target.value as "sales" | "quantity")}
        >
          <option value="sales">Ventas</option>
          <option value="quantity">Cantidad</option>
        </Select>

        <Datepicker
          language="es-MX"
          value={startDate}
          onChange={(date) => {
            if (date) setStartDate(date);
          }}
        />
        <Datepicker
          language="es-MX"
          value={endDate || undefined}
          onChange={(date) => {
            if (date) setEndDate(date);
          }}
        />

        <ToggleSwitch
          className="items-center"
          checked={isContinuous}
          label="Vista continua"
          onChange={setIsContinuous}
        />
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400} className={"bg-white"}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {keys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`hsl(${(idx * 90) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

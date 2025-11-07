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
  Bar,
  BarChart,
  LabelList,
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
} from "../services/api";

export default function ComparisonsGraphs() {
  const [metric, setMetric] = useState<"sales" | "quantity">("sales");
  const [frequency, setFrequency] = useState<Frequency>("daily");
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
  type GenerateYearlyChartDataParams = {
    selectedBranches: number[];
    selectedCategories: number[];
    startDate: Date | null;
    endDate: Date | null;
    metric: "sales" | "quantity";
    setChartData: (data: any[]) => void;
    branches: { id: number; name: string }[];
    categories: { id: number; name: string }[];
  };
  const generateYearlyChart = async function ({
    selectedBranches,
    selectedCategories,
    startDate,
    endDate,
    metric,
    setChartData,
    branches,
    categories,
  }: GenerateYearlyChartDataParams) {
    if (selectedBranches.length === 0 || !startDate || !endDate) {
      setChartData([]);
      return;
    }
    setFrequency("weekly_custom");
    const nextYearStartDate: Date = new Date(startDate);

    nextYearStartDate.setFullYear(startDate.getFullYear() + 1);
    console.log(`next year start: ${nextYearStartDate}`);
    const nextYearEndDate: Date = new Date(endDate);
    nextYearEndDate.setFullYear(endDate.getFullYear() + 1);
    console.log(`next year end: ${nextYearEndDate}`);

    const selectedYearRequest = {
      branchIds: selectedBranches,
      startDate,
      endDate,
      frequency,
    };
    const nextYearRequest = {
      branchIds: selectedBranches,
      startDate: nextYearStartDate,
      endDate: nextYearEndDate,
      frequency,
    };
    const actualReports = await fetchComparisonData(selectedYearRequest);
    const nextYearReports = await fetchComparisonData(nextYearRequest);

    // No los juntamos todavía
    const years = [
      {
        year: selectedYearRequest.startDate.getFullYear(),
        data: actualReports,
      },
      { year: nextYearRequest.startDate.getFullYear(), data: nextYearReports },
    ];

    const chartMap: Record<string, any> = {};

    years.forEach(({ year, data }) => {
      data.forEach((r) => {
        const dateObj = new Date(r.endDate);
        const monthIndex = dateObj.getMonth(); // 0..11
        const yearVal = dateObj.getFullYear();

        // Número de semana dentro del mes (1,2,3,...)
        const weekOfMonth = Math.floor((dateObj.getDate() - 1) / 7) + 1;

        // Etiqueta para mostrar: "S1 nov"
        const monthLabel = dateObj.toLocaleString("es-MX", { month: "short" });
        const label = `S${weekOfMonth} ${monthLabel}`;

        // sortKey numérico que ordena cronológicamente: año*10000 + mes*100 + semana
        // (por ejemplo: 20241102 -> 2024 noviembre semana 2)
        const sortKey = yearVal * 10000 + (monthIndex + 1) * 100 + weekOfMonth;

        if (!chartMap[label]) chartMap[label] = { date: label, sortKey };

        const branchName =
          branches.find((b) => b.id === r.branchId)?.name ??
          `Sucursal ${r.branchId}`;

        if (selectedCategories.length === 0) {
          const key = `${branchName} ${year}`;
          const value = metric === "sales" ? r.totalSales : r.totalSold;
          chartMap[label][key] = value;
        } else {
          const source =
            metric === "sales" ? r.salesByCategory : r.quantitiesByCategory;

          selectedCategories.forEach((categoryId) => {
            const categoryName =
              categories.find((c) => c.id === categoryId)?.name ?? "";
            const key = `${branchName} - ${categoryName} ${year}`;
            const value = source[categoryName] ?? 0;
            chartMap[label][key] = value;
          });
        }
      });
    });

    // Ordenamos por sortKey (cronológico) y luego quitamos sortKey si quieres
    const formatted = Object.values(chartMap)
      .sort((a: any, b: any) => a.sortKey - b.sortKey)
      .map((row: any) => {
        // opcional: eliminar sortKey antes de setear chartData
        const { sortKey, ...rest } = row;
        return rest;
      });

    setChartData(formatted);

    return;
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

    if (frequency == "weekly_custom") {
      generateYearlyChart({
        selectedBranches,
        selectedCategories,
        startDate,
        endDate,
        metric,
        setChartData,
        branches,
        categories,
      });
      return;
    }
    // 4️⃣ Si la vista es continua: mostrar líneas sucursal-categoría o totales
    if (isContinuous) {
      const fetchedReports = await fetchComparisonData(request);
      // 3️⃣ Obtener los reportes
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

      const formatted = Object.values(chartMap)
        .map((row: any) => {
          const d = new Date(`${row.date}T00:00:00`);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          return {
            ...row,
            date: `${day}/${month}/${year}`,
          };
        })
        .sort(
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
      const firstWeekday = firstDayOfMonth.getDay();
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
      const allKeys = new Set<string>();

      // 🔹 Recorremos todos los objetos (no solo el primero) para incluir todas las posibles claves
      chartData.forEach((row) => {
        Object.keys(row).forEach((key) => {
          if (key !== "date") allKeys.add(key);
        });
      });

      // 🔹 Convertimos el Set a array y lo ordenamos alfabéticamente
      setKeys(Array.from(allKeys).sort());
    }
  }, [chartData]);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px 12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              color: "#333",
              marginBottom: "6px",
            }}
          >
            {label}
          </p>

          {payload.map((entry: any, idx: number) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#333",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: entry.color,
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontWeight: 500 }}>{entry.name}:</span>
              <span style={{ fontWeight: 600 }}>
                {entry.value?.toLocaleString("en-US")}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
          <option value="weekly_custom">Anual por semana</option>
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
          <Tooltip
            formatter={(value, name) => [value.toLocaleString("en-US"), name]}
            labelStyle={{ color: "black" }}
            contentStyle={{
              border: "none",
              color: "#eee",
            }}
          />

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
      {frequency == "weekly_custom" && (
        <ResponsiveContainer width="100%" height={400} className={"bg-white"}>
          <BarChart data={chartData} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />

            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {keys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`hsl(${(idx * 90) % 360}, 70%, 50%)`}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey={key}
                  position="top"
                  content={({ x, y, width, value }) => {
                    if (
                      value == null ||
                      x == null ||
                      y == null ||
                      width == null
                    )
                      return null;
                    const xNum = Number(x);
                    const yNum = Number(y);
                    const widthNum = Number(width);
                    return (
                      <text
                        x={xNum + widthNum / 2}
                        y={yNum - 5}
                        fill="#333"
                        fontSize={12}
                        textAnchor="middle"
                      >
                        {" "}
                        {value.toLocaleString("en-US")}{" "}
                      </text>
                    );
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

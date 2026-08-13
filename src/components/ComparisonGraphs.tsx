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
  Button,
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
  Frequency,
  ReportRow,
  fetchGraphData,
} from "../services/api";
import BranchMultiSelect from "./BranchMultiSelect";
import MermaComparison from "@/features/batch/components/live-chicken/MermaComparison";
import SalesAnalyticsContent from "@/features/sales-analytics/components/SalesAnalyticsContent";
import { useParams } from "react-router-dom";

export default function ComparisonsGraphs() {
  const { slug } = useParams();
  const isBranches = slug === "sucursales";
  const [activeTab, setActiveTab] = useState<
    "pollo-huevo" | "ventas" | "merma"
  >("pollo-huevo");
  const [metric, setMetric] = useState<"sales" | "quantity">("sales");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [isContinuous, setIsContinuous] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [graphData, setGraphData] = useState<ReportRow[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [chartData, setChartData] = useState<Record<string, number | string>[]>(
    [],
  );

  const branchBaseColors: Record<string, string> = {
    Roneli: "#FF6B6B", // rojo coral
    Express: "#4ECDC4", // turquesa
    Amanecer: "#FFA500", // naranja fuerte
    "Express Fcp": "#556270", // gris azulado
    Saban: "#C44DFF", // morado vibrante
    CEDIS: "#2ECC71", // verde brillante
    Esperanza: "#3498DB", // azul brillante
    "Sucursal 8": "#E67E22", // naranja oscuro
  };

  function adjustBrightness(hex: string, percent: number) {
    const num = parseInt(hex.replace("#", ""), 16);

    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0xff) + percent;
    let b = (num & 0xff) + percent;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }
  function extractYear(key: string): string | null {
    const parts = key.trim().split(" ");
    const last = parts[parts.length - 1];
    return /^\d{4}$/.test(last) ? last : null;
  }

  function getCombinedColor(branchName: string, year: string) {
    const baseColor = branchBaseColors[branchName] || "#999999";

    const yearBrightness: Record<string, number> = {
      "2025": 0,
      "2024": -80,
      "2023": -150,
    };

    const brightness = yearBrightness[year] ?? 0;

    return adjustBrightness(baseColor, brightness);
  }
  function isPastYear(key: string): boolean {
    const year = extractYear(key);
    if (!year) return false; // keys sin año = año actual

    const currentYear = new Date().getFullYear();
    return Number(year) < currentYear;
  }

  function getColorForKey(key: string) {
    const year = extractYear(key);

    // quitar el año del final si existe
    const cleaned = year ? key.replace(year, "").trim() : key;

    // dividir por el primer " - "
    const branchName = cleaned.split(" - ")[0].trim();

    return year
      ? getCombinedColor(branchName, year)
      : branchBaseColors[branchName] || "#999999";
  }

  type GenerateChartDataParams = {
    selectedBranches: number[];
    selectedCategories: string[];
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
    metric,
    setChartData,
  }: GenerateChartDataParams) {
    if (selectedBranches.length === 0 || !startDate || !endDate) {
      setChartData([]);
      return;
    }

    const request = {
      branchIds: selectedBranches,
      categories: selectedCategories,
      compareSelf: isContinuous,
      startDate,
      endDate,
      metric,
      frequency,
    };

    const reports = await fetchGraphData(request);
    setGraphData(reports);
  };

  // 🧩 Utilidad: genera el nombre del grupo según la frecuencia

  useEffect(() => {
    if (graphData.length === 0) {
      setKeys([]);
      return;
    }

    const allKeys = Array.from(
      new Set(
        graphData.flatMap((row) =>
          Object.keys(row).filter(
            (key) => key !== "label" && typeof row[key] === "number",
          ),
        ),
      ),
    );

    setKeys(allKeys);
  }, [graphData]);

  useEffect(() => {
    console.log(selectedCategories);
  }, [selectedCategories]);
  // Cargar sucursales y categorías
  useEffect(() => {
    fetchBranches().then((data) =>
      setBranches(Array.isArray(data) ? data : []),
    );
    fetchCategories().then((data) =>
      setCategories(Array.isArray(data) ? data : []),
    );
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // Filtrar por categorías y calcular el valor a graficar según metric
  function handleGraph() {
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
  }

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

  const totals: Record<string, number> = {};

  if (graphData.length > 0) {
    const keys = Object.keys(graphData[0]).filter((k) => k !== "label");

    keys.forEach((key) => {
      totals[key] = graphData.reduce((acc, row) => {
        const value = row[key];
        return acc + (typeof value === "number" ? value : 0);
      }, 0);
    });
  }
  const grandTotal = Object.values(totals).reduce((acc, val) => acc + val, 0);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-center text-xl font-semibold">Comparaciones</h1>

      {isBranches && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("pollo-huevo")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "pollo-huevo"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Pollo y Huevo
          </button>
          <button
            onClick={() => setActiveTab("ventas")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "ventas"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Ventas
          </button>
          <button
            onClick={() => setActiveTab("merma")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "merma"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Merma
          </button>
        </div>
      )}

      {isBranches && activeTab === "pollo-huevo" && <SalesAnalyticsContent />}

      {(!isBranches || activeTab === "ventas") && (
        <>
          <div className="mb-6 flex flex-wrap items-end gap-2">
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
                    | "daily_custom"
                    | "weekly_custom",
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
              <option value="daily_custom">Anual por día</option>
            </Select>

            <div className="max-w-60">
              <BranchMultiSelect
                branches={branches}
                selected={selectedBranches}
                onChange={setSelectedBranches}
              />
            </div>

            <Dropdown
              className="!rounded-lg !border !border-gray-700 !bg-gray-700 !text-gray-100 !shadow-sm focus:!ring-2 focus:!ring-blue-500"
              dismissOnClick={false}
              label="Categorías"
            >
              {categories.map((category) => (
                <div key={category.id} className="px-1 py-1">
                  <label className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 select-none hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Checkbox
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => toggleCategory(category.name)}
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
              onChange={(e) =>
                setMetric(e.target.value as "sales" | "quantity")
              }
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
            <Button onClick={handleGraph} className="blue">
              Graficar
            </Button>
          </div>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={400} className="bg-white">
            <LineChart
              data={graphData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString("en-US"),
                  name,
                ]}
                labelStyle={{ color: "black" }}
                contentStyle={{ border: "none", color: "#333" }}
              />
              <Legend
                formatter={(value: string) => {
                  // Calculamos el total de esa serie
                  let total = 0;
                  graphData.forEach((row) => {
                    const v = row[value];
                    if (typeof v === "number") total += v;
                  });

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span>{value}</span>
                      <span style={{ fontWeight: "bold" }}>
                        {total.toLocaleString("en-US")}
                      </span>
                    </div>
                  );
                }}
              />

              {keys.length > 0 &&
                Object.keys(graphData[0] ?? {})
                  .filter((k) => k !== "label")
                  .map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={getColorForKey(key)}
                      strokeWidth={3}
                      strokeDasharray={isPastYear(key) ? "5 5" : ""}
                      dot={{ r: 3 }}
                    />
                  ))}
              {/* Etiqueta flotante dentro del SVG */}
              <text
                x="98%"
                y="92%"
                textAnchor="end"
                dominantBaseline="central"
                fontSize="14"
                fill="#000"
                opacity="0.8"
                style={{ fontWeight: "bold" }}
              >
                TOTAL: {grandTotal.toLocaleString("en-US")}
              </text>
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={400} className="bg-white">
            <BarChart
              data={graphData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              barCategoryGap="0%" // ← elimina los espacios vacíos EN EL GRUPO
              barGap={0} // ← elimina espacios entre barras del mismo grupo
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString("en-US"),
                  name,
                ]}
                labelStyle={{ color: "black" }}
                contentStyle={{ border: "none", color: "#333" }}
              />
              <Legend />

              {Object.keys(graphData[0] ?? {})
                .filter((k) => k !== "label")
                .map((key) => {
                  const color = getColorForKey(key); // ← aquí ya decides el color final

                  return (
                    <Bar key={key} dataKey={key} fill={color}>
                      <LabelList
                        dataKey={key}
                        content={(props) => {
                          const { x, y, width, value } = props;

                          // Convertir TODO a número
                          const numX = Number(x);
                          const numY = Number(y);
                          const numWidth = Number(width);
                          const numValue = Number(value);

                          // Si algo no es número → no dibujar
                          if (
                            isNaN(numX) ||
                            isNaN(numY) ||
                            isNaN(numWidth) ||
                            isNaN(numValue)
                          ) {
                            return null;
                          }

                          // No mostrar si la barra es demasiado angosta
                          if (numWidth < 15) return null;

                          // Ajustar separación para valores grandes
                          const offset = numValue < 1000 ? 12 : 18;

                          return (
                            <text
                              x={numX + numWidth / 2}
                              y={numY - offset}
                              textAnchor="middle"
                              fontSize={12}
                              fill="#333"
                              style={{ pointerEvents: "none" }}
                            >
                              {numValue.toLocaleString()}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  );
                })}
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {isBranches && activeTab === "merma" && <MermaComparison />}
    </div>
  );
}

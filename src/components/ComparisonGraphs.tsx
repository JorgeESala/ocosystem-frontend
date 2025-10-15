import React, { useState, useEffect } from "react";
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
  ReportEntry,
  fetchComparisonData, // Debes crear esta función en tu api.ts
} from "../services/api";

export default function ComparisonsGraphs() {
  const [frequency, setFrequency] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");
  const [metric, setMetric] = useState<"totalSales" | "slaughteredChicken">(
    "totalSales",
  );
  const [switch1, setSwitch1] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [reportData, setReportData] = useState<ReportEntry[]>([]);

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
    if (selectedBranches.length === 0) {
      setReportData([]);
      return;
    }
    if (!startDate || !endDate || selectedBranches.length === 0) return;

    const request = {
      branchIds: selectedBranches,
      startDate,
      endDate,
      frequency: frequency,
    };

    fetchComparisonData(request).then((allReports) => {
      // allReports ya es un arreglo plano con entries de varias sucursales
      const chartData: Record<string, any> = {};

      allReports.forEach((r) => {
        const date = r.startDate.split("T")[0]; // YYYY-MM-DD
        const branchName =
          branches.find((b) => b.id === r.branchId)?.name ??
          `Sucursal ${r.branchId}`;

        if (!chartData[date]) chartData[date] = { date };
        chartData[date][branchName] = r[metric as keyof ReportEntry];
      });

      // Convertimos a arreglo y ordenamos por fecha
      const formattedData = Object.values(chartData).sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setReportData(formattedData);
    });
  }, [selectedBranches, startDate, endDate, metric, frequency]);

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
          <option value="daily">Diario</option>
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
          onChange={(e) =>
            setMetric(e.target.value as "totalSales" | "slaughteredChicken")
          }
        >
          <option value="totalSales">Ventas</option>
          <option value="slaughteredChicken">Matados</option>
        </Select>

        <Datepicker
          language="es-MX"
          value={startDate || undefined}
          onChange={setStartDate}
        />
        <Datepicker
          language="es-MX"
          value={endDate || undefined}
          onChange={setEndDate}
        />

        <ToggleSwitch
          className="items-center"
          checked={switch1}
          label="Vista continua"
          onChange={setSwitch1}
        />
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={reportData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedBranches.map((branchId, idx) => {
            const branchName =
              branches.find((b) => b.id === branchId)?.name ??
              `Sucursal ${branchId}`;
            return (
              <Line
                key={branchId}
                type="monotone"
                dataKey={branchName}
                stroke={`hsl(${(idx * 90) % 360}, 70%, 50%)`}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

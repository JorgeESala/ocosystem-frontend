import axios from "axios";

// Tipos
export interface Branch {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface WeeklyReport {
  branchId: number;
  categoryId?: number;
  weekStart: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  totalSold: number;
  totalBought: number;
  gut?: number;
  waste?: number;
  salesByCategory?: Record<string, number>;
  salesByProduct?: Record<string, number>;
  expensesByCategory?: Record<string, number>;
}

export interface MonthlyCategoryReport {
  branchId: number;
  categoryId: number;
  yearMonth: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  gut?: number;
  waste?: number;
  salesByProduct: Record<string, number>[];
  quantitiesByProduct: Record<string, number>[];
  weeklyReports: WeeklyReport[];
}

export interface MonthlyReport {
  branchId: number;
  yearMonth: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  salesByCategory: Record<string, number>[];
  expensesByCategory: Record<string, number>[];
  weeklyReports: WeeklyReport[];
}
export interface DailyReport {
  branchId: number;
  date: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  gut?: number;
  waste?: number;
  salesByCategory: Record<string, number>[];
  salesByProduct: Record<string, number>[];
  quantitiesByProduct: Record<string, number>[];
  expensesByCategory: Record<string, number>[];
}

// -------------------- FETCH FUNCTIONS --------------------

// Sucursales
export const fetchBranches = async (): Promise<Branch[]> => {
  const res = await axios.get("http://localhost:8080/api/branches");
  return res.data;
};
export async function fetchWeeklyReport(
  branchId: number,
  categoryId: number,
  date: string,
): Promise<WeeklyReport> {
  const res = await fetch(
    `http://localhost:8080/api/reports/weekly-category?branchId=${branchId}&categoryId=${categoryId}&date=${date}`,
  );
  if (!res.ok) throw new Error("Error fetching weekly report");
  return res.json();
}

// Categorías
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get("http://localhost:8080/api/categories");
  return res.data;
};

// Reporte mensual por categoría
export const fetchMonthlyCategoryReportWithWeeks = async (
  branchId: number,
  categoryId: number,
  year: number,
  month: number,
): Promise<MonthlyCategoryReport> => {
  const res = await axios.get(
    "http://localhost:8080/api/reports/monthly-category",
    {
      params: { branchId, categoryId, year, month },
    },
  );
  return res.data;
};

// Reporte mensual general (todas las categorías)
export async function fetchMonthlyReport(
  branchId: number,
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const res = await fetch(
    `http://localhost:8080/api/reports/monthly?branchId=${branchId}&year=${year}&month=${month}`,
  );
  if (!res.ok) throw new Error("Error fetching monthly report");
  return res.json();
}

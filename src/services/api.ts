import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
// Tipos
export interface Branch {
  id: number;
  name: string;
}
export interface Batch {
  id: number;
  branch: Branch;
  kgTotal: number;
  pricePerKg: number;
  date: Date;
  provider: string;
  chickenQuantity: number;
  priceTotal?: number;
  avgChickenWeight: number;
}
export interface DailyBatchSaleRequest {
  id?: number;
  batchId: string | number;
  quantitySold: string | number;
  kgTotal: string | number;
  saleTotal: string;
  kgGut: string | number;
  date: Date | null;
}

export interface DailyBatchSale {
  id: number;
  batch: Batch;
  quantitySold: number;
  kgTotal: number;
  saleTotal: number;
  kgGut: number;
  date: Date;
}
export interface BatchRequest {
  id?: number;
  branchId: string | number;
  kgTotal: string | number;
  pricePerKg: string | number;
  date: Date | null;
  provider: string;
  chickenQuantity: string | number;
}

export interface Category {
  id: number;
  name: string;
}
export interface Measurement_unit {
  name: string;
  code: string;
}
export interface Product {
  barcode: string;
  name: string;
  category: Category;
  measurement_unit: Measurement_unit;
}
export interface ProductReport {
  product: Product;
  quantitySold: number;
  totalSales: number;
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
  eggs?: number;
  slaughteredChicken?: number;
  eggCartonsQuantity?: number;
  eggsSales?: number;
  salesByCategory: Record<string, number>[];
  salesByProduct: Record<string, number>[];
  quantitiesByProduct: Record<string, number>[];
  expensesByCategory: Record<string, number>[];
}
export type Frequency = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export interface WeeklyReport {
  branchId: number;
  categoryId?: number;
  weekStart: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  gut?: number;
  waste?: number;
  eggs?: number;
  eggCartons?: number;
  eggsSales?: number;
  salesByCategory?: Record<string, number>;
  salesByProduct?: Record<string, number>;
  expensesByCategory?: Record<string, number>;
  dailyReports?: DailyReport[];
}

export interface MonthlyReport {
  branchId: number;
  yearMonth: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  eggs?: number;
  eggCartons?: number;
  eggsSales?: number;
  salesByCategory: Record<string, number>[];
  expensesByCategory: Record<string, number>[];
  weeklyReports: WeeklyReport[];
  productReports: ProductReport[];
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
export interface ReportEntry {
  branchId: number;
  startDate: string;
  endDate: string;
  frequency: Frequency;

  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;

  gut?: number;
  waste?: number;
  slaughteredChicken?: number;
  eggs?: number;
  eggCartons?: number;
  eggsSales?: number;
  salesByCategory: Record<string, number>;
  salesByProduct?: Record<string, number>;
  quantitiesByProduct: Record<string, number>;
  quantitiesByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface ComparisonRequest {
  branchIds: number[];
  startDate: Date;
  endDate: Date;
  frequency: Frequency;
}

// -------------------- FETCH FUNCTIONS --------------------

// Sucursales
export const fetchBranches = async (): Promise<Branch[]> => {
  const res = await axios.get(`${API_URL}/api/branches`);
  return res.data;
};
export const createBatch = async function (batch: BatchRequest) {
  const response = await fetch(`${API_URL}/api/batches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    throw new Error("Error al crear el batch");
  }

  const data: Batch = await response.json();
  return data;
};
export const createDailyBatchSale = async function (
  batchSale: DailyBatchSaleRequest,
) {
  const response = await fetch(`${API_URL}/api/batchSales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batchSale),
  });

  if (!response.ok) {
    throw new Error("Error al Agregar la venta");
  }

  const data: Batch = await response.json();
  return data;
};

export const updateDailyBatchSale = async function (batchSale: DailyBatchSale) {
  const response = await fetch(`${API_URL}/api/batchSales/${batchSale.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batchSale),
  });

  if (!response.ok) {
    throw new Error("Error al Agregar la venta");
  }

  const data: Batch = await response.json();
  return data;
};

export const fetchBatches = async (): Promise<Batch[]> => {
  const res = await axios.get(`${API_URL}/api/batches`);
  return res.data;
};
export const fetchBatchSales = async (): Promise<DailyBatchSale[]> => {
  const res = await axios.get(`${API_URL}/api/batchSales`);
  return res.data;
};
export async function fetchBatchSalesById(
  id: number,
): Promise<DailyBatchSale[]> {
  const res = await axios.get(`${API_URL}/api/batchSales/${id}`);
  return res.data;
}

export async function fetchWeeklyReport(
  branchId: number,
  date: Date,
): Promise<WeeklyReport> {
  const isoWithOffset = date.toISOString().replace("Z", "-05:00");

  const res = await fetch(
    `${API_URL}/api/reports/weekly?branchId=${branchId}&date=${encodeURIComponent(isoWithOffset)}`,
  );
  if (!res.ok) throw new Error("Error fetching weekly report");
  return res.json();
}

export async function fetchWeeklyReportByCategory(
  branchId: number,
  categoryId: number,
  date: Date,
): Promise<WeeklyReport> {
  const res = await fetch(
    `${API_URL}/api/reports/weekly?branchId=${branchId}&categoryId=${categoryId}&date=${date}`,
  );
  if (!res.ok) throw new Error("Error fetching weekly report");
  return res.json();
}

// Categorías
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get(`${API_URL}/api/categories`);
  return res.data;
};

// Reporte mensual por categoría
export const fetchMonthlyCategoryReportWithWeeks = async (
  branchId: number,
  categoryId: number,
  year: number,
  month: number,
): Promise<MonthlyCategoryReport> => {
  const res = await axios.get(`${API_URL}/api/reports/monthly-category`, {
    params: { branchId, categoryId, year, month },
  });
  return res.data;
};

// Reporte mensual general (todas las categorías)
export async function fetchMonthlyReport(
  branchId: number,
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const res = await fetch(
    `${API_URL}/api/reports/monthly?branchId=${branchId}&year=${year}&month=${month}`,
  );
  if (!res.ok) throw new Error("Error fetching monthly report");
  return res.json();
}

export async function fetchComparisonData(
  request: ComparisonRequest,
): Promise<ReportEntry[]> {
  try {
    // Hacer un fetch por cada branch
    const allReports = await Promise.all(
      request.branchIds.map(async (branchId) => {
        const params = new URLSearchParams();
        params.append("branchId", branchId.toString());
        params.append("startDate", request.startDate.toISOString());
        params.append("endDate", request.endDate.toISOString());
        params.append("frequency", request.frequency);

        const res = await fetch(`${API_URL}/api/reports?${params.toString()}`);

        if (!res.ok) throw new Error(`Error fetching branch ${branchId}`);

        const data: ReportEntry[] = await res.json();
        // Añadimos branchId a cada entry para identificar la sucursal
        return data.map((entry) => ({ ...entry, branchId }));
      }),
    );

    // Aplanar el array de arrays
    return allReports.flat();
  } catch (err) {
    console.error(err);
    return [];
  }
}
export const fetchBatchSalesByBatch = async (
  batchId: number | string,
): Promise<DailyBatchSale[]> => {
  console.log(batchId);
  const res = await axios.get(`${API_URL}/api/batchSales/${batchId}`);
  return res.data;
};

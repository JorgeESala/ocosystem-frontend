import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
export interface Expense {
  id: number;
  branch: Branch;
  category: Category;
  amount: number;
  date: string;
  reason: string;
}
export interface ExpenseRequest {
  branchId: number;
  categoryId: number;
  amount: number;
  date: Date;
  reason: string;
}
export interface FetchExpenseRequest {
  branchIds: number[];
  startDate: Date;
  endDate: Date;
}
export interface ExpenseCategory {
  id: number;
  name: string;
}
export interface Category {
  id: number;
  name: string;
}
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
  saleTotal: number;
  kgGut: string | number;
  date: Date | null;
  employeeId?: number;
}
export interface Employee {
  id: number;
  name: string;
}
export interface DailyBatchSale {
  id: number;
  batch: Batch;
  employee: Employee | null;
  quantitySold: number;
  kgTotal: number;
  saleTotal: number;
  kgGut: number;
  date: Date;
}
export interface BatchSaleUpdateRequest {
  id: number;
  batchId: number;
  employeeId?: number;
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
}
export interface ReportRow {
  label: string;
  [key: string]: number | string;
}
export type Frequency =
  | "hourly"
  | "daily"
  | "daily_custom"
  | "weekly"
  | "weekly_custom"
  | "monthly"
  | "yearly";

export interface WeeklyReport {
  branchId: number;
  categoryId?: number;
  weekStart: string;
  totalSales: number;
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
  dailyReports?: DailyReport[];
}

export interface MonthlyReport {
  branchId: number;
  yearMonth: string;
  totalSales: number;
  totalProfit: number;
  totalSold: number;
  totalBought: number;
  eggs?: number;
  eggCartons?: number;
  eggsSales?: number;
  salesByCategory: Record<string, number>[];
  weeklyReports: WeeklyReport[];
  productReports: ProductReport[];
}

export interface MonthlyCategoryReport {
  branchId: number;
  categoryId: number;
  yearMonth: string;
  totalSales: number;
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
}
export interface GraphData {
  branchIds: number[];
  startDate: string;
  metric: string;
  endDate: string;
  frequency: Frequency;
  compareWithPreviousYear: boolean;
}

export interface ComparisonRequest {
  branchIds: number[];
  startDate: Date;
  endDate: Date;
  frequency: Frequency;
}
export interface GraphRequest {
  branchIds: number[];
  compareSelf: boolean;
  startDate: Date;
  endDate: Date;
  metric: string;
  frequency: Frequency;
  categories?: string[];
}
export interface profitReportRequest {
  branchIds: number[];
  startDate: string;
  endDate: string;
}
export interface profitReport {
  start: string;
  end: string;
  totalSales: number;
  totalExpenses: number;
  totalChickenCostProRated: number;
  profit: number;
  totalSold: number;
  batchDetails: BatchCostDetail[];
}
export interface BatchCostDetail {
  batchId: number;
  branchName: string;
  totalBatchCost: number;
  chickenQuantity: number;
  avgChickenWeight: number;
  pricePerKg: number;
  aspKg: number;
  quantitySoldInRange: number;
  kgSoldInRange: number;
  computedCostForRange: number;
}

// -------------------- FETCH FUNCTIONS --------------------
export async function fetchProfitReport(
  request: profitReportRequest,
): Promise<profitReport> {
  const res = await fetch(
    `${API_URL}/api/reports/profit?branchIds=${request.branchIds}&start=${request.startDate.toISOString().split("T")[0]}&end=${request.endDate.toISOString().split("T")[0]}`,
  );
  if (!res.ok) throw new Error("Error fetching profit report");
  return res.json();
}
export const fetchExpensesByBranchesAndDateRange = async (
  branchIds: number[],
  start: Date,
  end: Date,
): Promise<Expense[]> => {
  const res = await axios.post(`${API_URL}/api/expenses/search`, {
    start: start.toISOString(),
    end: end.toISOString(),
    branchIds: branchIds,
  });
  return res.data;
};
export const fetchBatchesByBranchesAndDateRange = async (
  branchIds: number[],
  start: Date,
  end: Date,
): Promise<Batch[]> => {
  const res = await axios.post(`${API_URL}/api/batches/search`, {
    start: start.toISOString(),
    end: end.toISOString(),
    branchIds: branchIds,
  });
  return res.data;
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get(`${API_URL}/api/employees`);
  return res.data;
};
export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await axios.get(`${API_URL}/api/expenses`);
  return res.data;
};
export const fetchLatestExpenses = async (): Promise<Expense[]> => {
  const res = await axios.get(`${API_URL}/api/expenses/latest`);
  return res.data;
};
export const fetchLatestBatches = async (): Promise<Batch[]> => {
  const res = await axios.get(`${API_URL}/api/batches/latest`);
  return res.data;
};
// Sucursales

export const fetchBranches = async (): Promise<Branch[]> => {
  const res = await axios.get(`${API_URL}/api/branches`);
  return res.data;
};
export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const res = await axios.get(`${API_URL}/api/expense-categories`);
  return res.data;
};
export const createExpense = async function (expense: ExpenseRequest) {
  const response = await fetch(`${API_URL}/api/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Error al crear el gasto");
  }

  const data: Expense = await response.json();
  return data;
};
export const updateExpense = async function (
  expenseId: number,
  expense: ExpenseRequest,
) {
  const response = await fetch(`${API_URL}/api/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Error al crear el gasto");
  }

  const data: Expense = await response.json();
  return data;
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

export const updateDailyBatchSale = async function (
  batchSale: BatchSaleUpdateRequest,
) {
  const payload = {
    id: batchSale.id,
    batchId: batchSale.batchId,
    employeeId: batchSale.employeeId,
    quantitySold: Number(batchSale.quantitySold),
    kgTotal: Number(batchSale.kgTotal),
    saleTotal: Number(batchSale.saleTotal),
    kgGut: Number(batchSale.kgGut),
    date: batchSale.date,
  };

  const response = await fetch(`${API_URL}/api/batchSales/${batchSale.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar la venta");
  }

  return response.json();
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
export async function fetchGraphData(
  request: GraphRequest,
): Promise<ReportRow[]> {
  try {
    const params = new URLSearchParams();
    const hasCategories = !!request.categories?.length;

    // Enviar TODAS las sucursales como múltiples parámetros:
    // branchId=1&branchId=2&branchId=3
    request.branchIds.forEach((id) => {
      params.append("branchId", id.toString());
    });

    params.append("startDate", request.startDate.toISOString());
    params.append("endDate", request.endDate.toISOString());
    params.append("frequency", request.frequency);
    params.append("compareSelf", (!request.compareSelf).toString());
    params.append("metric", request.metric);
    params.append("includeCategories", hasCategories.toString());

    if (request.categories) {
      request.categories.forEach((cat) => params.append("categories", cat));
    }

    const res = await fetch(`${API_URL}/api/reports?${params.toString()}`);

    if (!res.ok) throw new Error("Error fetching reports");

    const data: ReportRow[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const fetchBatchSalesByBatch = async (
  batchId: number | string,
): Promise<DailyBatchSale[]> => {
  const res = await axios.get(`${API_URL}/api/batchSales/${batchId}`);
  return res.data;
};

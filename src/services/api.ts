import axios from "axios";
import type { AxiosError } from "axios";
import { triggerUnauthorized } from "./authEvents";
import type { Client } from "@/features/processed/client/types/client.types";
const API_URL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL: `${API_URL}`,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      triggerUnauthorized();
    }
    return Promise.reject(err);
  },
);
const toISODate = (date: Date): string => date.toISOString().split("T")[0];

function handleApiError(err: unknown, defaultMessage: string): never {
  const error = err as AxiosError<{ message?: string }>;

  // Get the status code from the response, defaults to 500 if undefined
  const statusCode = error.response?.status ?? 500;

  // Get the specific message from the server, or use the default Axios message
  const serverMessage = error.response?.data?.message ?? error.message;

  // Create a new Error object combining necessary info
  // We launch the error with the message provided by the server/Axios.
  const apiError = new Error(serverMessage || defaultMessage);

  // Attach the status code to the error object for easy reading in the component
  (apiError as any).status = statusCode;

  throw apiError;
}

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
  branchId: number;
  branchName: string;
  kgTotal: number;
  pricePerKg: number;
  date: Date;
  provider: string;
  chickenQuantity: number;
  priceTotal?: number;
  avgChickenWeight: number;
}
export interface BatchUpdateRequest {
  branchId: number;
  kgTotal: number;
  pricePerKg: number;
  date: Date | null;
  provider: string;
  chickenQuantity: number;
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
  clientId?: number;
}
export interface Employee {
  id: number;
  name: string;
  role: string;
  position: string;
}

export interface DailyBatchSale {
  id: number;
  batch: Batch;
  employee: Employee | null;
  client?: Client;
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
  clientId?: number;
  quantitySold: number;
  kgTotal: number;
  saleTotal: number;
  kgGut: number;
  date: Date;
}

export interface BatchRequest {
  branchId: number | string;
  chickenQuantity: number | string;
  kgTotal: number | string;
  pricePerKg: number | string;
  provider: string;
  date: Date | null;
}
export interface BatchSearchRequest {
  branchIds: number[];
  startDate: string;
  endDate: string;
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
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface ChangeCredentialsRequest {
  name: string;
  email: string;
  newPassword: string;
}
export interface MeResponse {
  name: string;
  email: string;
}

// -------------------- FETCH FUNCTIONS --------------------
export async function fetchMe(): Promise<MeResponse> {
  const res = await http.get("/me");
  return res.data;
}
export async function changeCredentials(data: ChangeCredentialsRequest) {
  const res = await http.post("/me/change-credentials", data);
  return res.data;
}
export async function loginUser(
  data: LoginRequest,
): Promise<{ token: string }> {
  try {
    const res = await http.post("/auth/login", data);
    return res.data;
  } catch (err: unknown) {
    // Do not translate the fallback message in the API layer.
    handleApiError(err, "Login failed");
  }
}

export async function registerUser(
  data: RegisterRequest,
): Promise<{ message: string }> {
  try {
    const res = await http.post("/auth/register", data);
    return res.data;
  } catch (err: unknown) {
    // Do not translate the fallback message in the API layer.
    handleApiError(err, "Registration failed");
  }
}

export async function fetchProfitReport(
  request: profitReportRequest,
): Promise<profitReport> {
  try {
    const res = await http.get(
      `/api/reports/profit?branchIds=${request.branchIds}&start=${request.startDate}&end=${request.endDate}`,
    );

    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg =
      error.response?.data?.message ||
      "Error al obtener el reporte de ganancias";

    throw new Error(msg);
  }
}
export const fetchExpensesByBranchesAndDateRange = async (
  branchIds: number[],
  start: Date,
  end: Date,
): Promise<Expense[]> => {
  const res = await http.post(`/api/expenses/search`, {
    start: start.toISOString(),
    end: end.toISOString(),
    branchIds: branchIds,
  });
  return res.data;
};

export const fetchBatchesByBranchesAndDateRange = async (
  branchIds: number[],
  startDate: Date,
  endDate: Date,
): Promise<Batch[]> => {
  const payload: BatchSearchRequest = {
    branchIds,
    startDate: toISODate(startDate),
    endDate: toISODate(endDate),
  };

  const res = await http.post("/api/batches/search", payload);
  return res.data;
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await http.get(`/api/employees`);
  return res.data;
};
export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await http.get(`/api/expenses`);
  return res.data;
};
export const fetchLatestExpenses = async (): Promise<Expense[]> => {
  const res = await http.get(`/api/expenses/latest`);
  return res.data;
};
export const fetchLatestBatches = async (): Promise<Batch[]> => {
  const res = await http.get(`/api/batches/latest`);
  return res.data;
};
// Sucursales

export const fetchBranches = async (): Promise<Branch[]> => {
  const res = await http.get(`/api/branches`);
  return res.data;
};
export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const res = await http.get(`/api/expense-categories`);
  return res.data;
};
export const createExpense = async function (expense: ExpenseRequest) {
  try {
    const response = await http.post(`/api/expenses`, expense);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg =
      error.response?.data?.message ||
      "Error al obtener el reporte de ganancias";

    throw new Error(msg);
  }
};
export const updateExpense = async function (
  expenseId: number,
  expense: ExpenseRequest,
) {
  try {
    const response = await http.put(
      `${API_URL}/api/expenses/${expenseId}`,
      expense,
    );

    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al actualizar gasto";

    throw new Error(msg);
  }
};
export const createBatch = async function (batch: BatchRequest) {
  try {
    const response = await http.post(`${API_URL}/api/batches`, batch);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al crear Remesa";

    throw new Error(msg);
  }
};
export const createDailyBatchSale = async function (
  batchSale: DailyBatchSaleRequest,
) {
  try {
    const response = await http.post(`${API_URL}/api/batchSales`, batchSale);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al agregar venta";

    throw new Error(msg);
  }
};

export const updateDailyBatchSale = async function (
  batchSale: BatchSaleUpdateRequest,
) {
  const payload = {
    id: batchSale.id,
    batchId: batchSale.batchId,
    employeeId: batchSale.employeeId,
    clientId: batchSale.clientId,
    quantitySold: Number(batchSale.quantitySold),
    kgTotal: Number(batchSale.kgTotal),
    saleTotal: Number(batchSale.saleTotal),
    kgGut: Number(batchSale.kgGut),
    date: batchSale.date,
  };
  try {
    const response = await http.put(
      `${API_URL}/api/batchSales/${batchSale.id}`,
      payload,
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al actualizar venta";

    throw new Error(msg);
  }
};
export async function updateBatch(id: number, data: BatchUpdateRequest) {
  const res = await http.put(`/api/batches/${id}`, data);
  return res.data;
}
export const fetchBatches = async (): Promise<Batch[]> => {
  const res = await http.get(`/api/batches`);
  return res.data;
};
export const fetchBatchSales = async (): Promise<DailyBatchSale[]> => {
  const res = await http.get(`/api/batchSales`);
  return res.data;
};
export async function fetchBatchSalesById(
  id: number,
): Promise<DailyBatchSale[]> {
  const res = await http.get(`/api/batchSales/${id}`);
  return res.data;
}

export async function fetchWeeklyReport(
  branchId: number,
  date: Date,
): Promise<WeeklyReport> {
  const isoWithOffset = date.toISOString().replace("Z", "-05:00");

  const res = await http.get(
    `/api/reports/weekly?branchId=${branchId}&date=${encodeURIComponent(isoWithOffset)}`,
  );
  return res.data;
}

export async function fetchWeeklyReportByCategory(
  branchId: number,
  categoryId: number,
  date: Date,
): Promise<WeeklyReport> {
  const res = await http.get(
    `/api/reports/weekly?branchId=${branchId}&categoryId=${categoryId}&date=${date}`,
  );
  return res.data;
}

// Categorías
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await http.get(`/api/categories`);
  return res.data;
};

// Reporte mensual por categoría
export const fetchMonthlyCategoryReportWithWeeks = async (
  branchId: number,
  categoryId: number,
  year: number,
  month: number,
): Promise<MonthlyCategoryReport> => {
  const res = await http.get(`/api/reports/monthly-category`, {
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
  const res = await http.get(
    `${API_URL}/api/reports/monthly?branchId=${branchId}&year=${year}&month=${month}`,
  );
  return res.data;
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

        const res = await http.get(`/api/reports?${params.toString()}`);

        const data: ReportEntry[] = await res.data;
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

    const res = await http.get(`${API_URL}/api/reports?${params.toString()}`);

    const data: ReportRow[] = await res.data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const fetchBatchSalesByBatch = async (
  batchId: number | string,
): Promise<DailyBatchSale[]> => {
  const res = await http.get(`/api/batchSales/${batchId}`);
  return res.data;
};

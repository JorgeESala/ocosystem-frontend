import type { AxiosError } from "axios";
import type { Client } from "@/features/processed/client/types/client.types";
import type { LoginResponse } from "@/auth/auth.dto";
import { http } from "@/shared/api/http";

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

export interface BranchesExpense {
  id: number;
  branchId: number;
  branchName: string;
  expenseCategoryName: string;
  amount: number;
  date: string;
  reason: string;
  businessUnitName: string;
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

const toNumber = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface BatchItemApi {
  id: number;
  branchId: number | null;
  cedisId: number | null;
  cedisName: string | null;
  kgTotal: string | null;
  pricePerKg: string | null;
  priceTotal: string | null;
  avgChickenWeight: string | null;
  date: string;
  provider: string | null;
  chickenQuantity: number | null;
  availableCost?: number | string | null;
}

export interface Batch {
  id: number;
  branchId: number | null;
  kgTotal: number;
  pricePerKg: number;
  priceTotal: number;
  avgChickenWeight: number;
  date: string;
  provider: string | null;
  chickenQuantity: number;
  availableCost: number | null;
}

export const mapBatchItem = (raw: BatchItemApi): Batch => {
  const kgTotal = toNumber(raw.kgTotal);
  const chickenQuantity = toNumber(raw.chickenQuantity);
  const explicitAvg = toNumber(raw.avgChickenWeight);
  const avgChickenWeight =
    explicitAvg > 0
      ? explicitAvg
      : chickenQuantity > 0
        ? kgTotal / chickenQuantity
        : 0;
  const rawCost = raw.availableCost;
  const parsedCost =
    rawCost === null || rawCost === undefined
      ? null
      : typeof rawCost === "number"
        ? rawCost
        : toNumber(rawCost);
  const availableCost =
    parsedCost === null ? null : Number.isFinite(parsedCost) && parsedCost > 0 ? parsedCost : null;
  return {
    id: raw.id,
    branchId: raw.branchId,
    kgTotal,
    pricePerKg: toNumber(raw.pricePerKg),
    priceTotal: toNumber(raw.priceTotal),
    avgChickenWeight,
    date: raw.date,
    provider: raw.provider,
    chickenQuantity,
    availableCost,
  };
};

export interface BatchUpdateRequest {
  type: "BRANCHES";
  branchId: number;
  supplierId: number;
  provider: string;
  chickenQuantity: number;
  kgTotal: string;
  pricePerKg?: string;
  entryDate: string;
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
  saleDate: string;
}

interface BatchSaleItemApi {
  id: number;
  batchId: number;
  branchId: number | null;
  employeeId: number;
  employeeName: string;
  clientId: number | null;
  clientName: string;
  quantitySold: string;
  kgTotal: string;
  kgGut: string;
  saleTotal: string;
  date: string;
  officeReceived: boolean;
}

export interface BranchesBatchSale {
  id: number;
  batchId: number | null;
  branchId: number | null;
  employeeId: number;
  employeeName: string;
  clientId: number | null;
  clientName: string;
  quantitySold: number;
  kgTotal: number;
  kgGut: number;
  saleTotal: number;
  date: string;
  officeReceived: boolean;
}

export const mapBranchSale = (raw: BatchSaleItemApi): BranchesBatchSale => ({
  id: raw.id,
  batchId: raw.batchId,
  branchId: raw.branchId,
  employeeId: raw.employeeId,
  employeeName: raw.employeeName,
  clientId: raw.clientId,
  clientName: raw.clientName,
  quantitySold: toNumber(raw.quantitySold),
  kgTotal: toNumber(raw.kgTotal),
  kgGut: toNumber(raw.kgGut),
  saleTotal: toNumber(raw.saleTotal),
  date: raw.date,
  officeReceived: Boolean(raw.officeReceived),
});

export interface BatchSaleCreateRequest {
  batchId: number;
  saleDate: string;
  saleTotal: string;
  employeeId?: number;
  clientId?: number;
  clientName?: string;
  quantity?: string;
  boxes?: string;
  cartons?: string;
  weight?: string;
  pricePerKg?: string;
  kgSent?: string;
  kgTotal?: string;
  kgGut?: string;
  officeReceived?: boolean;
  notes?: string;
}

export interface BatchSaleUpdateRequest {
  id: number;
  batchId: number;
  employeeId?: number;
  clientId?: number;
  saleDate: string;
  saleTotal: string;
  quantity?: string;
  kgTotal?: string;
  kgGut?: string;
  officeReceived?: boolean;
}

export interface BatchRequest {
  type: "BRANCHES";
  branchId: number;
  supplierId: number;
  provider: string;
  chickenQuantity: number;
  kgTotal: string;
  pricePerKg?: string;
  entryDate: string;
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
export interface MeasurementUnit {
  id: number;
  name: string;
  code: string;
}
export interface Product {
  barcode: string;
  name: string;
  category: Category;
  measurement_unit: MeasurementUnit;
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
  totalChickenCostsProRated: number;
  profit: number;
  batchDetails: BatchCostDetail[];
  cashDetails: BusinessUnitCashDetail[];
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
  totalSalesInRange: number;
}
export interface BusinessUnitCashDetail {
  businessUnitName: string;
  totalSales: number;
  totalExpenses: number;
  expectedCash: number;
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

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await http.post<LoginResponse>("/auth/login", data);
    return res.data;
  } catch (err: unknown) {
    handleApiError(err, "Login failed");
    throw err;
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
    const params = new URLSearchParams();

    request.branchIds.forEach((branchId) => {
      params.append("branchIds", branchId.toString());
    });
    params.append("start", request.startDate);
    params.append("end", request.endDate);

    const res = await http.get(`/api/reports/profit?${params.toString()}`);

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
): Promise<BranchesExpense[]> => {
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

  const res = await http.post("/api/v1/batches/search", payload);
  return (res.data as BatchItemApi[]).map(mapBatchItem);
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await http.get(`/api/employees`);
  return res.data;
};
export const fetchExpenses = async (): Promise<BranchesExpense[]> => {
  const res = await http.get(`/api/expenses`);
  return res.data;
};
export const fetchLatestExpenses = async (): Promise<BranchesExpense[]> => {
  const res = await http.get(`/api/expenses/latest`);
  return res.data;
};
export const fetchLatestBatches = async (): Promise<Batch[]> => {
  const res = await http.get(`/api/v1/batches/latest?limit=15`);
  return (res.data as BatchItemApi[]).map(mapBatchItem);
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
    const response = await http.put(`/api/expenses/${expenseId}`, expense);

    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al actualizar gasto";

    throw new Error(msg);
  }
};
export const createBatch = async function (batch: BatchRequest) {
  try {
    const response = await http.post(`/api/v1/batches`, batch);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al crear Remesa";

    throw new Error(msg);
  }
};
export const createDailyBatchSale = async function (
  batchSale: BatchSaleCreateRequest,
) {
  try {
    const response = await http.post(`/api/v1/batch-sales`, batchSale);
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
  try {
    const response = await http.put(
      `/api/v1/batch-sales/${batchSale.id}`,
      batchSale,
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || "Error al actualizar venta";

    throw new Error(msg);
  }
};
export async function updateBatch(id: number, data: BatchUpdateRequest) {
  const res = await http.put(`/api/v1/batches/${id}`, data);
  return res.data;
}
export const fetchBatches = async (): Promise<Batch[]> => {
  const res = await http.get(`/api/v1/batches`);
  return (res.data as BatchItemApi[]).map(mapBatchItem);
};
export const fetchBatchSales = async (): Promise<DailyBatchSale[]> => {
  const res = await http.get(`/api/v1/batch-sales`);
  return res.data;
};
export async function fetchBatchSalesById(
  id: number,
): Promise<DailyBatchSale[]> {
  const res = await http.get(`/api/v1/batch-sales/${id}`);
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
    `/api/reports/monthly?branchId=${branchId}&year=${year}&month=${month}`,
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

    const res = await http.get(`/api/reports?${params.toString()}`);

    const data: ReportRow[] = await res.data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const fetchBatchSalesByBatch = async (
  batchId: number | string,
): Promise<BranchesBatchSale[]> => {
  const res = await http.get(`/api/v1/batch-sales/batch/${batchId}`);
  return (res.data as BatchSaleItemApi[]).map(mapBranchSale);
};

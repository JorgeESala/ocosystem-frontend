export type BusinessUnitType = "EGG" | "LIVE_CHICKEN" | "PORK" | "BRANCHES";

export interface Batch {
  id: number;
  type: BusinessUnitType;
  supplierId: number;
  supplierName: string;
  debtorEntityId?: number;
  cedisId?: number;
  cedisName?: string;
  entryDate: string;
  totalAmount: string;
  metadata: Record<string, any>;

  initialQuantity: string;
  soldQuantity: string;
  remainingQuantity: string;
  remainingBoxes: number;
  remainingCartons: number;
  remainingPieces: number;
}
export interface BatchResponseDTO {
  id: number;
  supplierId: number;
  supplierName: string;
  debtorEntityId?: number;
  cedisId: number;
  cedisName: string;
  entryDate: string;
  totalAmount: string;
  type: BusinessUnitType;
  metadata: Record<string, any>;

  // --- Inventario y Cantidades ---
  initialQuantity: string;
  soldQuantity: string;
  adjustedQuantity: string; // Bajas totales
  remainingQuantity: string;

  // --- Rendimiento Físico
  weightReal?: string;
  weightSold?: string;
  weightAdjusted?: string;
  weightDiff?: string;

  // --- KPIs Financieros (BI) ---
  amountDiff?: string;
  totalSalesAmount?: string;
  averagePricePerKg?: string;
  estimatedProfit?: string;
  realPricePerKg?: string;
  availableCost?: string | null;

  // --- Huevo ---
  remainingBoxes: number;
  remainingCartons: number;
  remainingPieces: number;

  // --- Sucursales (type === "BRANCHES") ---
  branchId?: number;
  provider?: string;
  chickenQuantity?: number;
  kgTotal?: string;
}

export interface BatchSale {
  id: number;
  batchId: number;
  saleDate: string;
  saleTotal: string;
  employeeId: number;
  employeeName: string;
  routeId?: number;
  routeName?: string;
  metadata: Record<string, any>;
  clientId?: number;
  kgTotal?: string;
  kgGut?: string;
  officeReceived?: boolean;
}

export interface Movement {
  id: number;
  type: "SALE" | "ADJUSTMENT";
  date: string;
  concept: string;
  quantity: number;
  weight: number;
  // Campos opcionales según el tipo de movimiento
  clientId?: number;
  employeeId?: number;
  saleTotal?: number;
  reason?: string;
}

export interface BatchDetailView {
  batch: Batch;
  summary: {
    initialPieces: number;
    soldPieces: number;
    adjustedPieces: number;
    availablePieces: number;
    formattedAvailable: string; // "5c, 2cs, 10pz"
  };
  movements: Movement[];
}

export interface BatchMovementsTableProps {
  batch: Batch;
  sales: BatchSale[];
  adjustments: any[];
}
export interface BatchPageProps {
  unitType: BusinessUnitType;
}
export interface BatchAdjustment {
  id?: number;
  batchId: number;
  weight: string;
  quantity: string;
  reason: string;
  adjustmentDate: string;
}

// Coincide con BatchRequestDTO
export interface BatchRequest {
  entryDate: string;
  type: BusinessUnitType;
  supplierId: number;
  debtorEntityId?: number; // El CEDIS que recibe

  // Datos físicos dinámicos
  weight?: string;
  pricePerKg?: string;
  boxQuantity?: string;
  cartonQuantity?: string;
  // En EGG, quantity representa piezas sueltas; en otras unidades es la cantidad base.
  quantity?: string;
  realWeight?: string;
  totalAmount?: string;
  notes?: string;

  // --- Sucursales (type === "BRANCHES") ---
  branchId?: number;
  provider?: string;
  chickenQuantity?: number;
  kgTotal?: string;
}

// Coincide con BatchSaleRequestDTO
export interface BatchSaleRequest {
  batchId: number;
  saleDate: string;
  saleTotal: string;
  employeeId?: number;
  clientId?: number;
  routeId?: number;
  clientName?: string;
  boxes?: string;
  cartons?: string;
  quantity?: string;
  weight?: string;
  pricePerKg?: string;
  kgSent?: string;
  kgTotal?: string;
  kgGut?: string;
  officeReceived?: boolean;
  notes?: string;
}

export interface BatchAdjustmentRequest {
  batchId: number;
  quantity: number;
  weight: number;
  reason: string;
  adjustmentDate: string;
}

export interface SupplierBreakdownItem {
  supplierId: number;
  supplierName: string;
  totalQuantity: number;
  totalSales: number;
}

export interface WeeklySalesData {
  weekStart: string;
  totalQuantity: number;
  totalSales: number;
  supplierBreakdown: SupplierBreakdownItem[];
}

export interface SalesByClientData {
  clientId: number;
  clientName: string;
  isInternalBranch: boolean;
  totalQuantity: number;
  totalSales: number;
}

export type BusinessUnitType = "EGG" | "LIVE_CHICKEN" | "PORK" | "BRANCHES";

export interface Batch {
  id: number;
  type: BusinessUnitType;
  supplierId: number;
  supplierName: string;
  debtorEntityId?: number;
  cedisName?: string;
  entryDate: string;
  totalAmount: number;
  metadata: Record<string, any>;

  initialQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  remainingBoxes: number;
  remainingCartons: number;
  remainingPieces: number;
}
export interface BatchResponseDTO {
  id: number;
  supplierId: number;
  supplierName: string;
  debtorEntityId?: number;
  cedisName?: string;
  entryDate: string;
  totalAmount: number;
  type: BusinessUnitType;
  metadata: Record<string, any>;

  // --- Inventario y Cantidades ---
  initialQuantity: number;
  soldQuantity: number;
  adjustedQuantity: number; // Bajas totales
  remainingQuantity: number;

  // --- Rendimiento Físico
  weightReal: number;
  weightSold: number;
  weightAdjusted: number;
  weightDiff: number;

  // --- KPIs Financieros (BI) ---
  amountDiff: number;
  totalSalesAmount: number;
  averagePricePerKg: number;
  estimatedProfit: number;
  realPricePerKg: number;

  // --- Huevo ---
  remainingBoxes: number;
  remainingCartons: number;
  remainingPieces: number;
}

export interface BatchSale {
  id: number;
  batchId: number;
  saleDate: string;
  saleTotal: number;
  employeeId: number;
  employeeName: string;
  routeId?: number;
  routeName?: string;
  // Aquí vendrá el desglose de aves/peso o cajas/cartones
  metadata: Record<string, any>;
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
  weight: number;
  quantity: number;
  reason: string;
  adjustmentDate: string;
}

// Coincide con BatchRequestDTO
export interface BatchRequest {
  entryDate: string;
  type: BusinessUnitType;
  supplierId: number;
  debtorEntityId: number; // El CEDIS que recibe

  // Datos físicos dinámicos
  weight?: number;
  pricePerKg?: number;
  boxQuantity?: number;
  cartonQuantity?: number;
  // En EGG, quantity representa piezas sueltas; en otras unidades es la cantidad base.
  quantity?: number;
  realWeight?: number;
  totalAmount?: number;
  notes?: string;
}

// Coincide con BatchSaleRequestDTO
export interface BatchSaleRequest {
  batchId: number;
  saleDate: string;
  saleTotal: number;
  employeeId?: number;
  clientId?: number;
  routeId?: number;

  // Datos específicos del negocio
  boxes?: number;
  cartons?: number;
  quantity?: number;
  weight?: number;
  pricePerKg?: number;
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

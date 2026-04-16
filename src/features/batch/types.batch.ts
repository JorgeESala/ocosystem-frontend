export type BusinessUnitType = "EGG" | "LIVE_CHICKEN" | "PORK" | "BRANCHES";

export interface Batch {
  id: number;
  type: BusinessUnitType;
  supplierId: number;
  supplierName: string;
  entryDate: string;
  totalAmount: number;
  metadata: Record<string, any>;

  initialQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;

  // --- CAMPOS DE DESGLOSE (Nuevos) ---
  remainingBoxes: number;
  remainingCartons: number;
  remainingPieces: number;
}
export interface BatchSale {
  id: number;
  batchId: number;
  employeeId: number;
  employeeName: string; // <-- Ahora garantizado por el Backend
  routeId?: number;
  routeName: string; // <-- Ahora garantizado por el Backend
  saleDate: string;
  saleTotal: number;
  metadata: Record<string, any>;
}
export interface Movement {
  id: number;
  type: "SALE" | "ADJUSTMENT";
  date: string;
  concept: string;
  quantity: number;
  weight: number;
  reason?: string;
}
export interface BatchDetailView {
  batch: Batch;
  summary: {
    initialPieces: number;
    soldPieces: number;
    adjustedPieces: number;
    availablePieces: number;
    formattedAvailable: string;
  };
  movements: Movement[];
}
export interface BatchMovementsTableProps {
  batch: Batch;
  sales: BatchSale[];
  adjustments: any[]; // Temporalmente any hasta definir ajustes
}
export interface BatchPageProps {
  unitType: BusinessUnitType;
}

export type AlertType =
  | "LOW_BALANCE"
  | "NEGATIVE_BALANCE"
  | "NEGATIVE_FLOW"
  | "HIGH_WASTE"
  | "OVERDUE_TASKS"
  | "DELIVERY_NOT_RECEIVED"
  | "PRODUCT_APPROVAL_PENDING";

export type AlertSeverity = "critical" | "warning";

export interface NotificationDTO {
  id: number;
  branchId: number;
  branchName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSummaryDTO {
  unreadCount: number;
  recent: NotificationDTO[];
}

export interface NotificationDetailDTO {
  alertType: AlertType;
  branchId: number;
  branchName: string;
  detail: unknown;
}

export interface WasteDetail {
  batchId: number;
  entryDate: string;
  provider: string;
  chickensReceived: number;
  kgTotal: number;
  chickensSold: number;
  kgSold: number;
  kgGut: number;
  mermaConTripa: number;
  mermaSinTripa: number;
  thresholdWarning: number;
  thresholdCritical: number;
  sales: WasteSaleRow[];
}

export interface WasteSaleRow {
  saleId: number;
  saleDate: string;
  clientName: string;
  employeeId: number | null;
  quantity: number;
  kgTotal: number;
  kgGut: number;
  saleTotal: number;
}

export interface ChecklistDetail {
  date: string;
  tasks: ChecklistTaskRow[];
  totalTasks: number;
  completedTasks: number;
}

export interface ChecklistTaskRow {
  taskId: string;
  label: string;
  status: string;
  detail: string;
  late: boolean | null;
  optional: boolean | null;
}

export interface DeliveryDetail {
  today: string;
  isDeliveryDay: boolean;
  expectedDays: string[];
  eggExpectedDays: string[];
  recentBatches: DeliveryBatchRow[];
}

export interface DeliveryBatchRow {
  batchId: number;
  entryDate: string;
  chickenQuantity: number | null;
  kgTotal: number | null;
  provider: string | null;
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  LOW_BALANCE: "Saldo bajo",
  NEGATIVE_BALANCE: "Saldo negativo",
  NEGATIVE_FLOW: "Tendencia negativa",
  HIGH_WASTE: "Merma elevada",
  OVERDUE_TASKS: "Tareas pendientes",
  DELIVERY_NOT_RECEIVED: "Entrega no recibida",
  PRODUCT_APPROVAL_PENDING: "Producto por aprobar",
};

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  LOW_BALANCE: "⚠",
  NEGATIVE_BALANCE: "🔴",
  NEGATIVE_FLOW: "📉",
  HIGH_WASTE: "🗑",
  OVERDUE_TASKS: "📋",
  DELIVERY_NOT_RECEIVED: "🚚",
  PRODUCT_APPROVAL_PENDING: "📦",
};

export const DETAIL_ALERT_TYPES = new Set<AlertType>([
  "HIGH_WASTE",
  "OVERDUE_TASKS",
  "DELIVERY_NOT_RECEIVED",
]);

export type AlertType =
  | "LOW_BALANCE"
  | "NEGATIVE_BALANCE"
  | "NEGATIVE_FLOW"
  | "SALES_DISCREPANCY"
  | "HIGH_WASTE";

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

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  LOW_BALANCE: "Saldo bajo",
  NEGATIVE_BALANCE: "Saldo negativo",
  NEGATIVE_FLOW: "Tendencia negativa",
  SALES_DISCREPANCY: "Discrepancia de ventas",
  HIGH_WASTE: "Merma elevada",
};

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  LOW_BALANCE: "⚠",
  NEGATIVE_BALANCE: "🔴",
  NEGATIVE_FLOW: "📉",
  SALES_DISCREPANCY: "📊",
  HIGH_WASTE: "🗑",
};

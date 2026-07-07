import { HiQuestionMarkCircle } from "react-icons/hi";
import {
  HiClipboardList,
  HiTrendingUp,
  HiExclamationCircle,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import type { MetricAccent } from "../types/checklist.types";

interface RegistryEntry {
  icon: IconType;
  accent: MetricAccent;
  shortLabel: string;
  longLabel: string;
}

const fallback: RegistryEntry = {
  icon: HiQuestionMarkCircle,
  accent: "gray",
  shortLabel: "Indicador",
  longLabel: "Indicador",
};

export const metricRegistry: Record<string, RegistryEntry> = {
  CHECKLIST: {
    icon: HiClipboardList,
    accent: "blue",
    shortLabel: "Checklist diario",
    longLabel: "Checklist diario",
  },
  SALES_GROWTH: {
    icon: HiTrendingUp,
    accent: "emerald",
    shortLabel: "Ventas vs periodo anterior",
    longLabel: "Ventas vs periodo anterior",
  },
  ACCOUNTS_PAYABLE: {
    icon: HiExclamationCircle,
    accent: "amber",
    shortLabel: "Cuentas por pagar",
    longLabel: "Cuentas por pagar",
  },
};

export const getMetricMeta = (id: string): RegistryEntry =>
  metricRegistry[id] ?? fallback;

export const TASK_LABELS: Record<string, string> = {
  UPLOAD_SALES_REPORT: "Subir reporte de ventas",
  REGISTER_EXPENSES: "Registrar gastos",
  REGISTER_SALES_AND_ENTRIES: "Registrar entradas y ventas",
  REVIEW_ACCOUNTS_PAYABLE: "Revisar cuentas por pagar",
};

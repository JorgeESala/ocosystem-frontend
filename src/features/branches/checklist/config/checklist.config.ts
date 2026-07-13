import type { IconType } from "react-icons";
import { FaBoxes, FaFileUpload } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import type { ChecklistTaskId } from "../types/checklist.types";

export interface TaskMeta {
  icon: IconType;
  accent: "blue" | "rose" | "amber" | "purple";
  shortLabel: string;
  actionPath: string;
}

export const TASK_META: Record<ChecklistTaskId, TaskMeta> = {
  UPLOAD_SALES_REPORT: {
    icon: FaFileUpload,
    accent: "blue",
    shortLabel: "Reporte",
    actionPath: "upload-reports",
  },
  REGISTER_EXPENSES: {
    icon: GiPayMoney,
    accent: "rose",
    shortLabel: "Gastos",
    actionPath: "expenses",
  },
  REGISTER_SALES_AND_ENTRIES: {
    icon: FaBoxes,
    accent: "amber",
    shortLabel: "Ventas",
    actionPath: "salesAndBatches",
  },
  REVIEW_ACCOUNTS_PAYABLE: {
    icon: GiReceiveMoney,
    accent: "purple",
    shortLabel: "Ctas x p",
    actionPath: "accounting",
  },
};

export const TASK_ORDER: ChecklistTaskId[] = [
  "UPLOAD_SALES_REPORT",
  "REGISTER_EXPENSES",
  "REGISTER_SALES_AND_ENTRIES",
  "REVIEW_ACCOUNTS_PAYABLE",
];

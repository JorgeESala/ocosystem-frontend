import { FaStore, FaEgg } from "react-icons/fa";
import { GiFeather, GiPig, GiCarrot } from "react-icons/gi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import type { BusinessType } from "./business.types";
import type { IconType } from "react-icons";

export interface BusinessMenuItem {
  to: string;
  label: string;
  icon: IconType;
  adminOnly?: boolean;
  group?: string;
}

export interface BusinessConfig {
  key: BusinessType;
  name: string;
  slug: string;
  icon: IconType;
  menu?: BusinessMenuItem[];
  hasTasks?: boolean;
}

import {
  FaChartBar,
  FaFileAlt,
  FaBoxes,
  FaClipboardList,
  FaTags,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaUniversity,
} from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import {
  HiClipboardList,
  HiClipboardCheck,
  HiUserGroup,
  HiOutlineTerminal,
} from "react-icons/hi";
import { HiBanknotes } from "react-icons/hi2";

export const BASE_MENU = [
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Gastos", icon: GiPayMoney },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
];
const BRANCHES_MENU = [
  { to: "mis-tareas", label: "Mis tareas", icon: HiClipboardCheck },
  { to: "checklist", label: "Desempeño", icon: HiClipboardList },
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  {
    to: "salesAndBatches",
    label: "Entradas y Ventas",
    icon: FaBoxes,
    group: "Operación",
  },
  {
    to: "recepciones",
    label: "Recepción",
    icon: FaClipboardList,
    group: "Operación",
  },
  {
    to: "productos",
    label: "Productos",
    icon: FaTags,
    group: "Operación",
  },
  {
    to: "aprobaciones",
    label: "Productos pendientes",
    icon: FaCheckCircle,
    adminOnly: true,
    group: "Operación",
  },
  { to: "expenses", label: "Gastos", icon: GiPayMoney, group: "Finanzas" },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney, group: "Finanzas" },
  {
    to: "general-cash",
    label: "Caja general",
    icon: HiBanknotes,
    group: "Finanzas",
  },
  {
    to: "accounting",
    label: "Contabilidad",
    icon: GiReceiveMoney,
    group: "Finanzas",
  },
  {
    to: "diagnostico",
    label: "App sucursal",
    icon: HiOutlineTerminal,
    adminOnly: true,
    group: "Administración",
  },
];

const LIVE_CHICKEN_MENU = [
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Registrar gasto", icon: GiPayMoney },
  { to: "clients-routes", label: "Clientes y Rutas", icon: HiUserGroup },
  { to: "accounting", label: "Contabilidad", icon: GiReceiveMoney },
  {
    to: "income-statement",
    label: "Estado de resultados",
    icon: FaFileInvoiceDollar,
  },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
  { to: "general-cash", label: "Caja general", icon: HiBanknotes },
];
const EGG_MENU = [
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Registrar gasto", icon: GiPayMoney },
  { to: "clients-routes", label: "Clientes y Rutas", icon: HiUserGroup },
  { to: "accounting", label: "Contabilidad", icon: GiReceiveMoney },
  {
    to: "income-statement",
    label: "Estado de resultados",
    icon: FaFileInvoiceDollar,
  },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
  { to: "general-cash", label: "Caja general", icon: HiBanknotes },
  { to: "cash-flow", label: "Flujo de efectivo", icon: FaUniversity },
];

export const BUSINESSES: BusinessConfig[] = [
  {
    key: "BRANCHES",
    name: "Sucursales",
    slug: "sucursales",
    icon: FaStore,
    menu: BRANCHES_MENU,
    hasTasks: true,
  },
  {
    key: "LIVE_CHICKEN",
    name: "Pollo vivo",
    slug: "pollo-vivo",
    icon: GiFeather,
    menu: LIVE_CHICKEN_MENU,
  },
  {
    key: "PIG",
    name: "Cerdo",
    slug: "cerdo",
    icon: GiPig,
  },
  {
    key: "EGG",
    name: "Huevo",
    slug: "huevo",
    icon: FaEgg,
    menu: EGG_MENU,
  },
  {
    key: "VEGETABLES",
    name: "Verduras",
    slug: "verduras",
    icon: GiCarrot,
  },
  {
    key: "GROCERIES",
    name: "Abarrotes",
    slug: "abarrotes",
    icon: MdOutlineLocalGroceryStore,
  },
];

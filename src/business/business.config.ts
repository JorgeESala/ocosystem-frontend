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
}

export interface BusinessConfig {
  key: BusinessType;
  name: string;
  slug: string;
  icon: IconType;
  menu?: BusinessMenuItem[];
  hasTasks?: boolean;
}

import { FaChartBar, FaFileAlt, FaBoxes } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { HiClipboardList, HiClipboardCheck, HiUserGroup } from "react-icons/hi";
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
  { to: "upload-reports", label: "Subir reporte", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Gastos", icon: GiPayMoney },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
  { to: "general-cash", label: "Caja general", icon: HiBanknotes },
  { to: "accounting", label: "Contabilidad", icon: GiReceiveMoney },
  { to: "aprobaciones", label: "Aprobaciones", icon: HiClipboardCheck, adminOnly: true },
];

const LIVE_CHICKEN_MENU = [
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Registrar gasto", icon: GiPayMoney },
  { to: "clients-routes", label: "Clientes y Rutas", icon: HiUserGroup },
  { to: "accounting", label: "Contabilidad", icon: GiReceiveMoney },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
];
const EGG_MENU = [
  { to: "reports", label: "Reportes", icon: FaFileAlt },
  { to: "graphs", label: "Comparativas", icon: FaChartBar },
  { to: "salesAndBatches", label: "Entradas y Ventas", icon: FaBoxes },
  { to: "expenses", label: "Registrar gasto", icon: GiPayMoney },
  { to: "clients-routes", label: "Clientes y Rutas", icon: HiUserGroup },
  { to: "accounting", label: "Contabilidad", icon: GiReceiveMoney },
  { to: "profit", label: "Ganancias", icon: GiReceiveMoney },
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

import { FaStore, FaEgg } from "react-icons/fa";
import { GiFeather, GiPig, GiCarrot } from "react-icons/gi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import type { BusinessType } from "./business.types";
import type { IconType } from "react-icons";

export interface BusinessConfig {
  key: BusinessType;
  name: string;
  slug: string;
  icon: IconType;
}

export const BUSINESSES: BusinessConfig[] = [
  {
    key: "BRANCHES",
    name: "Sucursales",
    slug: "sucursales",
    icon: FaStore,
  },
  {
    key: "LIVE_CHICKEN",
    name: "Pollo vivo",
    slug: "pollo-vivo",
    icon: GiFeather,
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

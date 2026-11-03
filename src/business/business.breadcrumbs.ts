import {
  BASE_MENU,
  type BusinessConfig,
  type BusinessMenuItem,
} from "./business.config";

export interface Breadcrumb {
  label: string;
}

const humanizeSegment = (segment: string) =>
  segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const SEGMENT_LABELS: Record<string, string> = {
  collections: "Cobrar",
  "delivery-schedule": "Programación de entregas",
  calendar: "Calendario",
  "upload-reports": "Importar reportes",
  "mis-tareas": "Mis tareas",
  admin: "Administración",
  help: "Ayuda",
};

const labelForSegment = (segment: string) =>
  SEGMENT_LABELS[segment] ?? humanizeSegment(segment);

const matchesItem = (
  pathname: string,
  base: string,
  item: BusinessMenuItem,
) => {
  const target = `${base}${item.to}`;
  return pathname === target || pathname.startsWith(`${target}/`);
};

export const findCurrentBusiness = (
  pathname: string,
  businesses: BusinessConfig[],
): BusinessConfig | null => {
  const match = pathname.match(/^\/business\/([^/]+)/);
  const slug = match?.[1];
  return slug
    ? (businesses.find((business) => business.slug === slug) ?? null)
    : null;
};

export const buildBreadcrumbs = (
  pathname: string,
  business: BusinessConfig,
): Breadcrumb[] => {
  const base = `/business/${business.slug}/`;
  const menu: BusinessMenuItem[] = business.menu ?? BASE_MENU;
  const item = menu
    .filter((candidate) => matchesItem(pathname, base, candidate))
    .sort((left, right) => right.to.length - left.to.length)[0];

  if (!item) {
    const segment = pathname.slice(base.length).split("/").filter(Boolean)[0];
    return [{ label: segment ? labelForSegment(segment) : "Inicio" }];
  }

  const crumbs: Breadcrumb[] = [];
  if (item.group) {
    crumbs.push({ label: item.group });
  }
  crumbs.push({ label: item.label });

  const itemPath = `${base}${item.to}`;
  const trailing = pathname.slice(itemPath.length).split("/").filter(Boolean);

  trailing.forEach((segment) => {
    crumbs.push({ label: labelForSegment(segment) });
  });

  return crumbs;
};

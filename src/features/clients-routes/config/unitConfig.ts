export type ClientsRoutesUnitType = "LIVE_CHICKEN" | "EGG";

export const CLIENTS_ROUTES_UNIT_LABELS: Record<ClientsRoutesUnitType, string> =
  {
    LIVE_CHICKEN: "Pollo Vivo",
    EGG: "Huevo",
  };

export interface Weekday {
  id: number;
  short: string;
  long: string;
}

export const WEEKDAYS: Weekday[] = [
  { id: 1, short: "Lun", long: "Lunes" },
  { id: 2, short: "Mar", long: "Martes" },
  { id: 3, short: "Mie", long: "Miércoles" },
  { id: 4, short: "Jue", long: "Jueves" },
  { id: 5, short: "Vie", long: "Viernes" },
  { id: 6, short: "Sab", long: "Sábado" },
  { id: 7, short: "Dom", long: "Domingo" },
];

export const weekdayShort = (day: number): string =>
  WEEKDAYS.find((weekday) => weekday.id === day)?.short ?? String(day);

export const currentMonthRange = (): { from: Date; to: Date } => {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  };
};

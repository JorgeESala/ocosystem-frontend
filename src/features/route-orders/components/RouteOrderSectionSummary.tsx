import { formatMXN } from "@/utils/moneyNumbers";
import type { RouteOrderTotals } from "../utils/routeOrderCalc";
import type { RouteOrderUnitType } from "../types/routeOrder.types";

interface Props {
  unitType: RouteOrderUnitType;
  internal: RouteOrderTotals;
  external: RouteOrderTotals;
}

const quantityText = (
  totals: RouteOrderTotals,
  unitType: RouteOrderUnitType,
): string =>
  unitType === "EGG"
    ? `${totals.totalQuantity} casilleros · ${totals.totalBoxes} cajas`
    : `${totals.totalQuantity} cabezas`;

const SummaryCard: React.FC<{
  title: string;
  totals: RouteOrderTotals;
  unitType: RouteOrderUnitType;
  tone: "internal" | "external";
}> = ({ title, totals, unitType, tone }) => (
  <div
    className={`rounded-2xl border p-4 ${
      tone === "internal"
        ? "border-emerald-700/50 bg-emerald-950/20"
        : "border-slate-700 bg-slate-900/40"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        {title}
      </p>
      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
        {totals.clientsWithOrder} con pedido
      </span>
    </div>
    <p className="mt-1 text-sm text-white">
      {quantityText(totals, unitType)}
      {unitType === "EGG" ? ` · ${formatMXN(totals.totalAmount)}` : ""}
    </p>
  </div>
);

export const RouteOrderSectionSummary: React.FC<Props> = ({
  unitType,
  internal,
  external,
}) => (
  <div className="grid gap-3 md:grid-cols-2">
    <SummaryCard
      title="Clientes internos"
      totals={internal}
      unitType={unitType}
      tone="internal"
    />
    <SummaryCard
      title="Clientes externos"
      totals={external}
      unitType={unitType}
      tone="external"
    />
  </div>
);

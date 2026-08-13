import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaBoxes, FaStore } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { HiArrowRight } from "react-icons/hi2";
import { EggQuantityDisplay } from "../components/egg/EggQuantityDisplay";
import { useBatches } from "../api/batch.queries";
import { getProfitReport } from "../profit/api/profit.api";
import { http } from "@/shared/api/http";
import { toIsoDateString } from "@/features/branches/checklist/utils/week";

export interface ProductDashboardConfig {
  unit: string;
  title: string;
  entityType: string;
  navDescription: string;
  useEggDisplay: boolean;
}

function formatCurrency(n: number) {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });
}

function Spinner() {
  return (
    <div className="flex justify-center py-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
    </div>
  );
}

function InventoryCard({
  unit,
  useEggDisplay,
}: {
  unit: string;
  useEggDisplay: boolean;
}) {
  const { slug } = useParams();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startDate = `${currentMonth}-01`;
  const endDate = toIsoDateString(now);

  const { data: batches = [], isLoading } = useBatches(
    unit,
    startDate,
    endDate,
  );

  const stats = useMemo(() => {
    const active = batches.filter(
      (b) =>
        Number(b.remainingQuantity) > 0 &&
        b.type === unit &&
        b.entryDate?.startsWith(currentMonth),
    );
    const totalRemaining = active.reduce(
      (sum, b) => sum + Number(b.remainingQuantity),
      0,
    );
    const totalValue = active.reduce(
      (sum, b) => sum + (Number(b.availableCost) || 0),
      0,
    );
    return { count: active.length, totalRemaining, totalValue };
  }, [batches, unit, currentMonth]);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <FaBoxes className="h-5 w-5 text-yellow-400" />
        <h2 className="text-sm font-semibold text-slate-200">Inventario</h2>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400">Disponible</p>
            {useEggDisplay ? (
              <EggQuantityDisplay totalPieces={stats.totalRemaining} />
            ) : (
              <span className="text-sm font-medium text-white">
                {stats.totalRemaining.toLocaleString()} aves
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Remesas activas</span>
            <span className="text-sm font-medium text-white">
              {stats.count}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Valor estimado</span>
            <span className="text-sm font-medium text-white">
              {formatCurrency(stats.totalValue)}
            </span>
          </div>
        </div>
      )}
      <div className="mt-4 border-t border-slate-700/40 pt-3">
        <Link
          to={`/business/${slug}/salesAndBatches`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 transition hover:gap-2"
        >
          Ver detalle
          <HiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function ProfitCard() {
  const { slug } = useParams();
  const now = new Date();
  const start = toIsoDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = toIsoDateString(now);

  const { data: profit, isLoading } = useQuery({
    queryKey: ["dashboardProfit", slug, start, end],
    queryFn: () => getProfitReport(start, end),
    refetchOnWindowFocus: true,
  });

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <GiReceiveMoney className="h-5 w-5 text-emerald-400" />
        <h2 className="text-sm font-semibold text-slate-200">
          Ganancia del mes
        </h2>
      </div>
      {isLoading ? (
        <Spinner />
      ) : profit ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Ventas</span>
            <span className="text-sm font-medium text-white">
              {formatCurrency(profit.totalSales)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Gastos</span>
            <span className="text-sm font-medium text-white">
              {formatCurrency(profit.totalExpenses)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Costos</span>
            <span className="text-sm font-medium text-white">
              {formatCurrency(profit.totalChickenCostsProRated)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/40 pt-3">
            <span className="text-xs font-semibold text-slate-300">
              Ganancia neta
            </span>
            <span
              className={`text-sm font-bold ${
                profit.profit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatCurrency(profit.profit)}
            </span>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-slate-500">
          Sin datos este mes
        </p>
      )}
      <div className="mt-4 border-t border-slate-700/40 pt-3">
        <Link
          to={`/business/${slug}/profit`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:gap-2"
        >
          Ver detalle
          <HiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function FinancialHealthCard({ entityType }: { entityType: string }) {
  const { slug } = useParams();
  const now = new Date();
  const start = toIsoDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = toIsoDateString(now);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboardFinancial", entityType, start, end],
    queryFn: async () => {
      const params = new URLSearchParams({
        entityType,
        from: start,
        to: end,
      });
      const { data } = await http.get(
        `/api/read/accounts-payable/cedis-financial-summary?${params}`,
      );
      return data;
    },
    refetchOnWindowFocus: true,
  });

  const totals = useMemo(() => {
    if (!Array.isArray(summary) || summary.length === 0) return null;
    return summary.reduce(
      (acc, row) => ({
        debt: acc.debt + (row.debt ?? 0),
        receivable: acc.receivable + (row.receivable ?? 0),
        inventoryValue: acc.inventoryValue + (row.inventoryValue ?? 0),
        netBalance: acc.netBalance + (row.netBalance ?? 0),
      }),
      { debt: 0, receivable: 0, inventoryValue: 0, netBalance: 0 },
    );
  }, [summary]);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <FaStore className="h-5 w-5 text-cyan-400" />
        <h2 className="text-sm font-semibold text-slate-200">
          Salud financiera
        </h2>
      </div>
      {isLoading ? (
        <Spinner />
      ) : totals ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Deuda proveedores</span>
            <span className="text-sm font-medium text-red-400">
              {formatCurrency(totals.debt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Por cobrar</span>
            <span className="text-sm font-medium text-emerald-400">
              {formatCurrency(totals.receivable)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Inventario</span>
            <span className="text-sm font-medium text-white">
              {formatCurrency(totals.inventoryValue)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/40 pt-3">
            <span className="text-xs font-semibold text-slate-300">
              Balance neto
            </span>
            <span
              className={`text-sm font-bold ${
                totals.netBalance >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatCurrency(totals.netBalance)}
            </span>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-slate-500">
          Sin datos financieros
        </p>
      )}
      <div className="mt-4 border-t border-slate-700/40 pt-3">
        <Link
          to={`/business/${slug}/accounting`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 transition hover:gap-2"
        >
          Ver detalle
          <HiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function NavigationCards() {
  const { slug } = useParams();
  const items = [
    {
      to: "salesAndBatches",
      label: "Entradas y Ventas",
      icon: FaBoxes,
      color: "text-yellow-400",
      desc: "Registra remesas y ventas diarias.",
    },
    {
      to: "expenses",
      label: "Gastos",
      icon: GiPayMoney,
      color: "text-red-400",
      desc: "Controla los gastos operativos.",
    },
    {
      to: "clients-routes",
      label: "Clientes y Rutas",
      icon: HiUserGroup,
      color: "text-purple-400",
      desc: "Gestiona clientes y rutas de entrega.",
    },
    {
      to: "accounting",
      label: "Contabilidad",
      icon: FaStore,
      color: "text-cyan-400",
      desc: "Cuentas por cobrar, pagar y resumen financiero.",
    },
    {
      to: "profit",
      label: "Ganancias",
      icon: GiReceiveMoney,
      color: "text-emerald-400",
      desc: "Consulta ventas, costos, gastos y ganancia neta.",
    },
  ];

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-300">
        Accesos rapidos
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={`/business/${slug}/${item.to}`}
              className="group rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition hover:border-slate-600 hover:bg-slate-800/70"
            >
              <Icon className={`mb-2 h-6 w-6 ${item.color}`} />
              <h3 className="text-sm font-semibold text-slate-200">
                {item.label}
              </h3>
              <p className="mt-1 text-[11px] leading-tight text-slate-500">
                {item.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const UNIT_CONFIGS: Record<string, ProductDashboardConfig> = {
  huevo: {
    unit: "EGG",
    title: "Huevo",
    entityType: "EGGCEDIS",
    navDescription: "Registra remesas y ventas diarias de huevo.",
    useEggDisplay: true,
  },
  "pollo-vivo": {
    unit: "LIVE_CHICKEN",
    title: "Pollo vivo",
    entityType: "CEDIS",
    navDescription: "Registra remesas y ventas diarias de pollo.",
    useEggDisplay: false,
  },
};

export default function ProductDashboard() {
  const { slug } = useParams();
  const config = UNIT_CONFIGS[slug ?? ""] ?? UNIT_CONFIGS.huevo;
  const now = new Date();
  const monthName = now.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">{config.title}</h1>
        <p className="text-sm text-slate-400">Vista general de la operacion</p>
      </header>

      <NavigationCards />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-300">
          Indicadores — {monthName}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <InventoryCard
            unit={config.unit}
            useEggDisplay={config.useEggDisplay}
          />
          <ProfitCard />
          <FinancialHealthCard entityType={config.entityType} />
        </div>
      </div>
    </div>
  );
}

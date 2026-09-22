import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiQuestionMarkCircle } from "react-icons/hi";
import { ClientsTab } from "../components/ClientsTab";
import { RoutesTab } from "../components/RoutesTab";
import { ClientRoutesSummaryTab } from "../components/ClientRoutesSummaryTab";
import {
  CLIENTS_ROUTES_UNIT_LABELS,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";

type TabKey = "summary" | "clients" | "routes";

type ClientsRouteFilter = "all" | "none" | number;

type ClientsTypeFilter = "all" | "branch" | "internal" | "external";

interface ClientsRoutesPageProps {
  unitType: ClientsRoutesUnitType;
}

export const ClientsRoutesPage: React.FC<ClientsRoutesPageProps> = ({
  unitType,
}) => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [clientsInitialRouteFilter, setClientsInitialRouteFilter] = useState<
    ClientsRouteFilter | undefined
  >(undefined);
  const [clientsInitialDormantDays, setClientsInitialDormantDays] = useState<
    number | null
  >(null);
  const [clientsInitialType, setClientsInitialType] =
    useState<ClientsTypeFilter>("all");
  const [routesInitialPeriod, setRoutesInitialPeriod] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [routesInitialDetailId, setRoutesInitialDetailId] = useState<
    number | null
  >(null);
  const unitLabel = CLIENTS_ROUTES_UNIT_LABELS[unitType];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== "clients") {
      setClientsInitialRouteFilter(undefined);
      setClientsInitialDormantDays(null);
      setClientsInitialType("all");
    }
    if (tab !== "routes") {
      setRoutesInitialPeriod(null);
      setRoutesInitialDetailId(null);
    }
  };

  const showClientsWithoutRoute = () => {
    setClientsInitialRouteFilter("none");
    setClientsInitialDormantDays(null);
    setClientsInitialType("all");
    setActiveTab("clients");
  };

  const showDormantClients = (dormantDays: number) => {
    setClientsInitialRouteFilter("all");
    setClientsInitialDormantDays(dormantDays);
    setClientsInitialType("all");
    setActiveTab("clients");
  };

  const showClientsByType = (
    clientType: "branch" | "internal" | "external",
  ) => {
    setClientsInitialRouteFilter("all");
    setClientsInitialDormantDays(null);
    setClientsInitialType(clientType);
    setActiveTab("clients");
  };

  const showRoutesWithoutActivity = (period: { from: Date; to: Date }) => {
    setRoutesInitialPeriod(period);
    setRoutesInitialDetailId(null);
    setActiveTab("routes");
  };

  const showRoutesWithoutLocalities = () => {
    setRoutesInitialPeriod(null);
    setRoutesInitialDetailId(null);
    setActiveTab("routes");
  };

  const showRouteDetail = (routeId: number) => {
    setRoutesInitialPeriod(null);
    setRoutesInitialDetailId(routeId);
    setActiveTab("routes");
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "summary", label: "Resumen" },
    { key: "clients", label: "Clientes" },
    { key: "routes", label: "Rutas" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Clientes y Rutas</h1>
          <p className="text-sm text-gray-400">
            Catálogo de {unitLabel}. Crea, edita o elimina clientes y rutas
            registradas en este negocio.
          </p>
        </div>
        <Link to={`/business/${slug}/clients-routes/help`}>
          <Button color="light" size="sm">
            <HiQuestionMarkCircle className="mr-2 h-4 w-4" />
            Ayuda
          </Button>
        </Link>
      </header>

      <div className="flex gap-2 border-b border-gray-700/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <ClientRoutesSummaryTab
          onShowClientsWithoutRoute={showClientsWithoutRoute}
          onShowDormantClients={showDormantClients}
          onShowRoutesWithoutActivity={showRoutesWithoutActivity}
          onShowRoutesWithoutLocalities={showRoutesWithoutLocalities}
          onShowClientsByType={showClientsByType}
          onShowRouteDetail={showRouteDetail}
        />
      )}

      {activeTab === "clients" && (
        <ClientsTab
          unitType={unitType}
          initialRouteFilter={clientsInitialRouteFilter}
          initialDormantDays={clientsInitialDormantDays}
          initialClientType={clientsInitialType}
        />
      )}

      {activeTab === "routes" && (
        <RoutesTab
          unitType={unitType}
          initialPerformancePeriod={routesInitialPeriod}
          initialDetailRouteId={routesInitialDetailId}
        />
      )}
    </div>
  );
};

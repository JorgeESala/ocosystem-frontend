import React, { useState } from "react";
import { ClientsTab } from "../components/ClientsTab";
import { RoutesTab } from "../components/RoutesTab";
import {
  CLIENTS_ROUTES_UNIT_LABELS,
  type ClientsRoutesUnitType,
} from "../config/unitConfig";

type TabKey = "clients" | "routes";

interface ClientsRoutesPageProps {
  unitType: ClientsRoutesUnitType;
}

export const ClientsRoutesPage: React.FC<ClientsRoutesPageProps> = ({
  unitType,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("clients");
  const unitLabel = CLIENTS_ROUTES_UNIT_LABELS[unitType];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Clientes y Rutas
          </h1>
          <p className="text-sm text-gray-400">
            Catálogo de {unitLabel}. Crea, edita o elimina clientes y rutas
            registradas en este negocio.
          </p>
        </div>
      </header>

      <div className="flex gap-2 border-b border-gray-700/60 pb-2">
        <button
          onClick={() => setActiveTab("clients")}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "clients"
              ? "bg-blue-600 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Clientes
        </button>
        <button
          onClick={() => setActiveTab("routes")}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "routes"
              ? "bg-blue-600 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Rutas
        </button>
      </div>

      {activeTab === "clients" ? <ClientsTab /> : <RoutesTab />}
    </div>
  );
};

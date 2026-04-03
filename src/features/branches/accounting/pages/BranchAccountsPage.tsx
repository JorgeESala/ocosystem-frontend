import { useMemo, useState } from "react";
import { Button } from "flowbite-react";

import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { useOpenAccounts } from "@/features/accounting/api/accounts-payable.queries";
import { AccountsPayableHistoryDrawer } from "@/features/accounting/components/AccountsPayableHistoryDrawer";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import { useBranches } from "@/context/BranchContext";
import { RegisterBranchPaymentModal } from "../components/RegisterBranchPaymentModal";
import { CreateBranchAccountsPayableModal } from "../components/CreateBranchAccountsPayableModal";
import { BranchesAccountsOpenTable } from "../components/BranchesAccountsOpenTable";

export const BranchAccountsPage = () => {
  // --- Estado de Selección ---
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const { branches, loading: loadingBranches } = useBranches();

  // --- UI State (Modales) ---
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);
  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- Data Fetching ---

  const { data = [], isLoading: loadingAccounts } = useOpenAccounts({
    debtorOriginalIds:
      selectedBranches.length > 0 ? selectedBranches : undefined,
    debtorEntityType: "BRANCH",
  });
  const totalDebt = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  }, [data]);

  // Handlers para la tabla
  const handlePay = (account: AccountsPayableResponse) =>
    setSelectedAccountForPay(account);
  const handleViewHistory = (account: AccountsPayableResponse) => {
    setSelectedAccountForHistory(account);
    setHistoryOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header con Título y Botón de Acción Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Cuentas de Sucursales
          </h1>
          <p className="text-sm text-gray-400">
            Gestión de cuentas por pagar de sucursales
          </p>
        </div>

        <Button
          onClick={() => setOpenCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Crear Nueva Cuenta
        </Button>
      </div>

      {/* --- NUEVA SECCIÓN: RESUMEN DE DEUDA --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Total Pendiente{" "}
            {selectedBranches.length > 0 ? "(Filtrado)" : "(Consolidado)"}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(totalDebt)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Documentos Abiertos
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400">
              {data.length}
            </span>
            <span className="text-sm text-nowrap text-gray-400">
              cuentas/remesas
            </span>
          </div>
        </div>

        {/* Card decorativa o informativa adicional */}
        <div className="hidden rounded-lg border border-gray-800 bg-blue-600/5 p-5 shadow-sm md:block">
          <p className="text-xs font-medium tracking-wider text-blue-400 uppercase">
            Estado de Flujo
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Visualizando deudas pendientes para{" "}
            {selectedBranches.length || branches?.length || 0} sucursales.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">Sucursales:</span>
          <div className="w-80">
            <BranchMultiSelect
              branches={branches ?? []}
              selected={selectedBranches}
              onChange={setSelectedBranches}
            />
          </div>
        </div>

        {selectedBranches.length > 0 && (
          <button
            onClick={() => setSelectedBranches([])}
            className="text-xs text-blue-400 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de Resultados */}
      <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
        {loadingAccounts || loadingBranches ? (
          <div className="p-12 text-center">
            <p className="animate-pulse text-gray-400">
              Cargando información consolidada...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">
              No se encontraron cuentas pendientes para la selección actual.
            </p>
          </div>
        ) : (
          <BranchesAccountsOpenTable
            data={data}
            onPay={handlePay}
            onViewHistory={handleViewHistory}
          />
        )}
      </div>

      {/* Modal: Ver Historial (Drawer o Modal) */}
      <AccountsPayableHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        account={selectedAccountForHistory}
      />

      {/* Modal: Crear Cuenta */}
      <CreateBranchAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        // Opcional: pasar las sucursales seleccionadas como sugerencia
        // suggestedBranchIds={selectedBranches}
      />

      {/* Modal: Registrar Pago */}
      <RegisterBranchPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
      />
    </div>
  );
};

import { useMemo, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiCog, HiPlus } from "react-icons/hi";
import { getLastDays } from "@/utils/date.utils";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useCashReserves, useGlobalCashFlow, useCashReserveAlerts, useUpdateCashReserve, useCreateCashReserve } from "../api/cashReserve.queries";
import CashPositionCard from "../components/CashPositionCard";
import CashFlowChart from "../components/CashFlowChart";
import BranchBreakdown from "../components/BranchBreakdown";
import AlertsPanel from "../components/AlertsPanel";
import SettingsModal from "../components/SettingsModal";
import CreateReserveModal from "../components/CreateReserveModal";
import CashReserveDrawer from "../components/CashReserveDrawer";
import type { CashFlowFrequency, CashReserveResponseDTO, UpdateCashReserveDTO, CreateCashReserveDTO } from "../types";

export default function CashReservePage() {
  const defaultRange = useMemo(() => getLastDays(30), []);
  const [frequency, setFrequency] = useState<CashFlowFrequency>("daily");
  const [selectedReserve, setSelectedReserve] = useState<CashReserveResponseDTO | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [drawerReserve, setDrawerReserve] = useState<CashReserveResponseDTO | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const { data: branches = [] } = useBranches();
  const reservesQuery = useCashReserves();
  const alertsQuery = useCashReserveAlerts();
  const updateMutation = useUpdateCashReserve();
  const createMutation = useCreateCashReserve();

  const reserves = reservesQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const existingBranchIds = reserves.map((r) => r.branchId);

  const flowQuery = useGlobalCashFlow(
    defaultRange.start,
    defaultRange.end,
    frequency,
  );

  const flow = flowQuery.data;
  const isLoading = reservesQuery.isLoading || flowQuery.isLoading;
  const isError = reservesQuery.isError;

  const totalBalance = useMemo(
    () => reserves.reduce((sum, r) => sum + r.currentBalance, 0),
    [reserves],
  );

  const handleOpenSettings = (e: React.MouseEvent, reserve: CashReserveResponseDTO) => {
    e.stopPropagation();
    setSelectedReserve(reserve);
    setShowSettings(true);
  };

  const handleCardClick = (reserve: CashReserveResponseDTO) => {
    setDrawerReserve(reserve);
    setShowDrawer(true);
  };

  const handleSaveSettings = (id: number, payload: UpdateCashReserveDTO) => {
    updateMutation.mutate(
      { id, payload },
      { onSuccess: () => setShowSettings(false) },
    );
  };

  const handleCreate = (payload: CreateCashReserveDTO) => {
    createMutation.mutate(payload, {
      onSuccess: () => setShowCreate(false),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Reserva de Efectivo
          </h1>
          <p className="text-sm text-slate-400">
            Posicion de efectivo por sucursal, flujo de caja y alertas.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <HiPlus className="mr-2 h-4 w-4" />
          Crear Reserva
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-red-950/40 p-6 text-center text-red-300">
          No se pudieron cargar los datos de reserva.
        </div>
      ) : (
        <>
          {/* Global summary */}
          <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-800 p-6">
            <div className="text-sm font-medium text-slate-400">
              Saldo Global
            </div>
            <div className="mt-1 text-3xl font-bold text-white">
              ${totalBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {reserves.length} sucursal{reserves.length !== 1 ? "es" : ""} registrada{reserves.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Alerts */}
          <AlertsPanel alerts={alerts} />

          {/* Per-branch cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Saldo por Sucursal
              </h2>
            </div>
            {reserves.length === 0 ? (
              <div className="rounded-xl bg-slate-800 p-10 text-center text-slate-400">
                No hay reservas creadas. Haz clic en "Crear Reserva" para empezar.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reserves.map((r) => (
                  <div
                    key={r.id}
                    className="relative cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => handleCardClick(r)}
                  >
                    <CashPositionCard reserve={r} />
                    <button
                      onClick={(e) => handleOpenSettings(e, r)}
                      className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                    >
                      <HiCog className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch breakdown chart */}
          {reserves.length > 0 && <BranchBreakdown reserves={reserves} />}

          {/* Cash flow chart */}
          {flow && (
            <CashFlowChart
              data={flow.points}
              frequency={frequency}
              onFrequencyChange={setFrequency}
            />
          )}
        </>
      )}

      {/* Settings modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        reserve={selectedReserve}
        onSave={handleSaveSettings}
        isSaving={updateMutation.isPending}
      />

      {/* Create modal */}
      <CreateReserveModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        branches={branches}
        existingBranchIds={existingBranchIds}
        onSave={handleCreate}
        isSaving={createMutation.isPending}
      />

      {/* History drawer */}
      <CashReserveDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        reserve={drawerReserve}
      />
    </div>
  );
}

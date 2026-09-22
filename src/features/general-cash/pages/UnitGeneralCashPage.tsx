import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { HiCog, HiPlus, HiQuestionMarkCircle } from "react-icons/hi";
import { getLastDays } from "@/utils/date.utils";
import {
  useCreateUnitCash,
  useRecalculateUnitCash,
  useUnitCashAccount,
  useUnitCashAlerts,
  useUnitCashFlow,
  useUpdateUnitCash,
} from "@/features/general-cash/api/unitCash.queries";
import { UNIT_CASH_CONFIG } from "@/features/general-cash/config/unitCash.config";
import UnitCashCard from "@/features/general-cash/components/UnitCashCard";
import UnitCashAlertsPanel from "@/features/general-cash/components/UnitCashAlertsPanel";
import UnitCashCreateModal from "@/features/general-cash/components/UnitCashCreateModal";
import UnitCashSettingsModal from "@/features/general-cash/components/UnitCashSettingsModal";
import UnitCashDrawer from "@/features/general-cash/components/UnitCashDrawer";
import CashFlowChart from "@/features/general-cash/components/CashFlowChart";
import type {
  CreateUnitCashDTO,
  UnitCashFrequency,
  UnitCashUnit,
  UpdateUnitCashDTO,
} from "@/features/general-cash/types.unit";

interface Props {
  unitType: UnitCashUnit;
}

export default function UnitGeneralCashPage({ unitType }: Props) {
  const { slug } = useParams();
  const config = UNIT_CASH_CONFIG[unitType];
  const defaultRange = useMemo(() => getLastDays(30), []);

  const [frequency, setFrequency] = useState<UnitCashFrequency>("daily");
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const accountQuery = useUnitCashAccount(unitType);
  const alertsQuery = useUnitCashAlerts(unitType);
  const createMutation = useCreateUnitCash(unitType);
  const updateMutation = useUpdateUnitCash(unitType);
  const recalculateMutation = useRecalculateUnitCash(unitType);
  const flowQuery = useUnitCashFlow(
    unitType,
    defaultRange.start,
    defaultRange.end,
    frequency,
  );

  const account = accountQuery.data ?? null;
  const alerts = alertsQuery.data ?? [];
  const flow = flowQuery.data;

  const handleCreate = (payload: CreateUnitCashDTO) => {
    createMutation.mutate(payload, { onSuccess: () => setShowCreate(false) });
  };

  const handleSaveSettings = (payload: UpdateUnitCashDTO) => {
    updateMutation.mutate(payload, { onSuccess: () => setShowSettings(false) });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Caja General</h1>
          <p className="text-sm text-slate-400">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/business/${slug}/general-cash/help`}>
            <Button color="light" size="sm">
              <HiQuestionMarkCircle aria-hidden className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
          </Link>
          {account && (
            <Button
              color="light"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <HiCog aria-hidden className="mr-2 h-4 w-4" />
              Configurar
            </Button>
          )}
        </div>
      </header>

      {accountQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : accountQuery.isError ? (
        <div className="rounded-xl bg-red-950/40 p-6 text-center text-red-300">
          No se pudieron cargar los datos de la caja general.
        </div>
      ) : !account ? (
        <div className="rounded-xl bg-slate-800 p-10 text-center">
          <h2 className="text-lg font-semibold text-white">
            Aun no hay caja general de {config.label}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Crea la caja para empezar a registrar el efectivo del negocio: las
            ventas, gastos, pagos y ajustes se reflejaran automaticamente.
          </p>
          <Button className="mx-auto mt-4" onClick={() => setShowCreate(true)}>
            <HiPlus className="mr-2 h-4 w-4" />
            Crear caja general
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-800 p-6">
            <div className="text-sm font-medium text-slate-400">
              Saldo actual
            </div>
            <div className="mt-1 text-3xl font-bold text-white">
              $
              {account.currentBalance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Saldo inicial: $
              {account.startingBalance.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
              {account.alertThreshold > 0 &&
                ` · Umbral de alerta: $${account.alertThreshold.toLocaleString(
                  "es-MX",
                  { minimumFractionDigits: 2 },
                )}`}
            </div>
          </div>

          <UnitCashAlertsPanel alerts={alerts} />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Posicion de efectivo
              </h2>
            </div>
            <div
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => setShowDrawer(true)}
            >
              <UnitCashCard name={config.label} account={account} />
            </div>
          </div>

          {flow && (
            <CashFlowChart
              data={flow.points}
              frequency={frequency}
              onFrequencyChange={setFrequency}
            />
          )}
        </>
      )}

      <UnitCashCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        unitLabel={config.label}
        onSave={handleCreate}
        isSaving={createMutation.isPending}
      />

      <UnitCashSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        account={account}
        onSave={handleSaveSettings}
        onRecalculate={() => recalculateMutation.mutate()}
        isSaving={updateMutation.isPending}
        isRecalculating={recalculateMutation.isPending}
      />

      <UnitCashDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        unit={unitType}
        unitLabel={config.label}
        account={account}
      />
    </div>
  );
}

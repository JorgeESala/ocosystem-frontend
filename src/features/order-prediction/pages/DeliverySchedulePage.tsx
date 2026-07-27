import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useBranches } from "@/features/branches/branch/branch.queries";
import {
  useDeliverySchedules,
  useUpdateDeliverySchedule,
} from "../api/orderPrediction.queries";

const DAYS = [
  { id: 1, name: "Lun" },
  { id: 2, name: "Mar" },
  { id: 3, name: "Mie" },
  { id: 4, name: "Jue" },
  { id: 5, name: "Vie" },
  { id: 6, name: "Sab" },
  { id: 7, name: "Dom" },
];

export default function DeliverySchedulePage() {
  const { slug } = useParams();
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: schedules = [], isLoading: loadingSchedules } =
    useDeliverySchedules();
  const updateMutation = useUpdateDeliverySchedule();

  const [localSchedules, setLocalSchedules] = useState<
    Record<number, { chicken: Set<number>; eggs: Set<number> }>
  >({});

  const getSelectedDays = (
    branchId: number,
    type: "chicken" | "eggs",
  ): Set<number> => {
    if (localSchedules[branchId]?.[type]) {
      return localSchedules[branchId][type];
    }
    const existing = schedules.find((s) => s.branchId === branchId);
    if (existing) {
      const days =
        type === "chicken" ? existing.deliveryDays : existing.eggDeliveryDays;
      return new Set(days ?? []);
    }
    return new Set();
  };

  const toggleDay = (
    branchId: number,
    dayId: number,
    type: "chicken" | "eggs",
  ) => {
    setLocalSchedules((prev) => {
      let current = prev[branchId];
      if (!current) {
        const existing = schedules.find((s) => s.branchId === branchId);
        current = {
          chicken: new Set(existing?.deliveryDays ?? []),
          eggs: new Set(existing?.eggDeliveryDays ?? []),
        };
      }
      const target = new Set(current[type]);
      if (target.has(dayId)) {
        target.delete(dayId);
      } else {
        target.add(dayId);
      }
      return {
        ...prev,
        [branchId]: { ...current, [type]: target },
      };
    });
  };

  const handleSave = async () => {
    const branchIds = new Set([
      ...Object.keys(localSchedules).map(Number),
      ...schedules.map((s) => s.branchId),
    ]);

    for (const branchId of branchIds) {
      const local = localSchedules[branchId];
      const existing = schedules.find((s) => s.branchId === branchId);

      const chickenDays = local?.chicken
        ? Array.from(local.chicken).sort()
        : (existing?.deliveryDays ?? []);
      const eggDays = local?.eggs
        ? Array.from(local.eggs).sort()
        : (existing?.eggDeliveryDays ?? []);

      if (local || !existing) {
        await updateMutation.mutateAsync({
          branchId,
          payload: {
            deliveryDays: chickenDays,
            eggDeliveryDays: eggDays,
          },
        });
      }
    }
    setLocalSchedules({});
  };

  const hasChanges = Object.keys(localSchedules).length > 0;
  const isLoading = loadingBranches || loadingSchedules;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Calendario de Entregas
          </h1>
          <p className="text-sm text-slate-400">
            Configura los dias de entrega de pollo y huevo para cada sucursal.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/business/${slug}/general-cash`}>
            <Button color="light" size="sm">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {branches.map((branch) => (
            <BranchScheduleRow
              key={branch.id}
              branch={branch}
              chickenDays={getSelectedDays(branch.id, "chicken")}
              eggDays={getSelectedDays(branch.id, "eggs")}
              onToggleChicken={(dayId) =>
                toggleDay(branch.id, dayId, "chicken")
              }
              onToggleEgg={(dayId) => toggleDay(branch.id, dayId, "eggs")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BranchScheduleRow({
  branch,
  chickenDays,
  eggDays,
  onToggleChicken,
  onToggleEgg,
}: {
  branch: { id: number; name: string };
  chickenDays: Set<number>;
  eggDays: Set<number>;
  onToggleChicken: (dayId: number) => void;
  onToggleEgg: (dayId: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{branch.name}</h3>

      <div className="mb-2 text-xs font-medium text-slate-400">Pollo</div>
      <div className="mb-3 flex gap-1">
        {DAYS.map((day) => (
          <button
            key={`ch-${day.id}`}
            onClick={() => onToggleChicken(day.id)}
            className={`h-8 w-10 rounded text-xs font-medium transition ${
              chickenDays.has(day.id)
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-500 hover:bg-slate-600"
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="mb-2 text-xs font-medium text-slate-400">Huevo</div>
      <div className="flex gap-1">
        {DAYS.map((day) => (
          <button
            key={`eg-${day.id}`}
            onClick={() => onToggleEgg(day.id)}
            className={`h-8 w-10 rounded text-xs font-medium transition ${
              eggDays.has(day.id)
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-slate-500 hover:bg-slate-600"
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>
    </div>
  );
}

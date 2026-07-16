import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Select, TextInput, Alert, Spinner } from "flowbite-react";
import { HiArrowLeft, HiTrash } from "react-icons/hi";
import { useBranches } from "@/features/branches/branch/branch.queries";
import {
  useExcludedBranches,
  useCreateExcludedBranch,
  useDeleteExcludedBranch,
} from "../api/excluded-branches.queries";

export default function ExcludedBranchesPage() {
  const { slug } = useParams();
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: excluded = [], isLoading: loadingExcluded } = useExcludedBranches();
  const createExclusion = useCreateExcludedBranch();
  const deleteExclusion = useDeleteExcludedBranch();

  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [reason, setReason] = useState("");

  const excludedBranchIds = new Set(excluded.map((e) => e.branchId));
  const availableBranches = branches.filter((b) => !excludedBranchIds.has(b.id));

  const handleAdd = () => {
    if (!selectedBranchId) return;
    createExclusion.mutate(
      { branchId: Number(selectedBranchId), reason: reason || undefined },
      {
        onSuccess: () => {
          setSelectedBranchId("");
          setReason("");
        },
      },
    );
  };

  if (loadingBranches || loadingExcluded) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Sucursales excluidas
          </h1>
          <p className="text-sm text-slate-400">
            Las sucursales excluidas no aparecen en el cálculo del puntaje de
            desempeño.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al desempeño
          </Button>
        </Link>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Excluir sucursal
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Sucursal
            </label>
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value) || "")}
            >
              <option value="">Seleccionar sucursal</option>
              {availableBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Razón (opcional)
            </label>
            <TextInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: No es una sucursal real"
            />
          </div>
          <Button
            color="blue"
            onClick={handleAdd}
            disabled={!selectedBranchId || createExclusion.isPending}
          >
            Excluir
          </Button>
        </div>
      </div>

      {createExclusion.isError && (
        <Alert color="failure">
          No se pudo excluir la sucursal:{" "}
          {(createExclusion.error as Error)?.message ?? "error"}
        </Alert>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Sucursales excluidas ({excluded.length})
        </h2>
        {excluded.length === 0 ? (
          <p className="text-sm text-slate-400">
            No hay sucursales excluidas actualmente.
          </p>
        ) : (
          <div className="space-y-2">
            {excluded.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
              >
                <div>
                  <span className="font-medium text-white">{e.branchName}</span>
                  {e.reason && (
                    <span className="ml-2 text-xs text-slate-400">
                      — {e.reason}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-rose-400 hover:text-rose-300"
                  onClick={() => e.id != null && deleteExclusion.mutate(e.id)}
                  disabled={deleteExclusion.isPending}
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import {
  Button,
  Card,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { formatHumanDate } from "@/utils/date.utils";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "../api/api-keys.queries";

export function ApiKeysSection() {
  const { data: keys, isLoading, isError } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const { data: branches } = useBranches();
  const [branchId, setBranchId] = useState<number | undefined>();
  const [label, setLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  if (isLoading)
    return (
      <Card>
        <p>Cargando llaves...</p>
      </Card>
    );
  if (isError)
    return (
      <Card>
        <p>Error al cargar llaves</p>
      </Card>
    );

  const handleCreate = () => {
    if (!branchId) return;
    createMutation.mutate(
      { branchId, label: label || null },
      {
        onSuccess: (result) => {
          setCreatedKey(result.plaintextKey);
          setBranchId(undefined);
          setLabel("");
        },
      },
    );
  };

  const handleCopy = () => {
    if (createdKey) navigator.clipboard?.writeText(createdKey);
  };

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">
        Llaves de sucursal (app de reportes)
      </h3>

      {createdKey && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            Llave generada — cópiala ahora, no se mostrará de nuevo
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-gray-100 px-2 py-1 text-xs break-all">
              {createdKey}
            </code>
            <Button size="xs" color="light" onClick={handleCopy}>
              Copiar
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="key-branch">Sucursal</Label>
          <Select
            id="key-branch"
            value={branchId ?? ""}
            onChange={(e) =>
              setBranchId(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Selecciona una sucursal</option>
            {branches?.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="key-label">Etiqueta (opcional)</Label>
          <TextInput
            id="key-label"
            className="w-48"
            placeholder="Ej: PC caja"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <Button
          color="blue"
          disabled={!branchId || createMutation.isPending}
          onClick={handleCreate}
        >
          Generar llave
        </Button>
      </div>

      {(keys ?? []).length === 0 ? (
        <p className="text-sm text-gray-500">No hay llaves registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Sucursal</TableHeadCell>
              <TableHeadCell>Etiqueta</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
              <TableHeadCell>Último uso</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableHead>
            <TableBody>
              {(keys ?? []).map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.branchName}</TableCell>
                  <TableCell>{key.label ?? "-"}</TableCell>
                  <TableCell>
                    {key.active ? (
                      <span className="text-green-600">Activa</span>
                    ) : (
                      <span className="text-red-600">Revocada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {key.lastUsedAt
                      ? formatHumanDate(key.lastUsedAt.slice(0, 10))
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    {key.active && (
                      <Button
                        size="xs"
                        color="red"
                        disabled={revokeMutation.isPending}
                        onClick={() => revokeMutation.mutate(key.id)}
                      >
                        Revocar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

import { Card, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Select, TextInput, Label } from "flowbite-react";
import { useState } from "react";
import type { PendingProductDTO } from "../types";
import { useApproveProduct, useCreateApiKey, usePendingProducts, useRevokeApiKey, useApiKeys } from "../api/approvals.queries";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import { useBranches } from "../../branch/branch.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";

export default function ProductApprovalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Aprobaciones</h2>
        <p className="text-sm text-gray-500">
          Confirma productos nuevos reportados por las sucursales y administra
          las llaves de acceso de la app de sucursal.
        </p>
      </div>
      <PendingProductsTable />
      <ApiKeysSection />
    </div>
  );
}

function PendingProductsTable() {
  const { data: pending, isLoading, isError } = usePendingProducts();
  const approveMutation = useApproveProduct();
  const { data: categories } = useCategories();
  const { data: units } = useMeasurementUnits();
  const [edits, setEdits] = useState<Record<string, PendingProductDTO>>({});

  if (isLoading) return <Card><p>Cargando productos pendientes...</p></Card>;
  if (isError) return <Card><p>Error al cargar productos pendientes</p></Card>;

  const products = pending ?? [];

  const getEdit = (product: PendingProductDTO) => edits[product.barcode] ?? product;

  const handleApprove = (product: PendingProductDTO) => {
    const edit = getEdit(product);
    approveMutation.mutate({
      barcode: product.barcode,
      payload: {
        name: edit.name,
        categoryId: edit.categoryId ?? undefined,
        unitId: edit.unitId ?? undefined,
      },
    });
  };

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">Productos pendientes de aprobación</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">No hay productos pendientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Código</TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Categoría</TableHeadCell>
              <TableHeadCell>Unidad</TableHeadCell>
              <TableHeadCell>Sucursal</TableHeadCell>
              <TableHeadCell>Ventas</TableHeadCell>
              <TableHeadCell>Monto</TableHeadCell>
              <TableHeadCell>Fecha</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const edit = getEdit(product);
                return (
                  <TableRow key={product.barcode}>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>
                      <TextInput
                        className="w-40"
                        value={edit.name}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [product.barcode]: { ...edit, name: e.target.value },
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        className="w-40"
                        value={edit.categoryId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEdits((prev) => ({
                            ...prev,
                            [product.barcode]: {
                              ...edit,
                              categoryId: value ? Number(value) : null,
                            },
                          }));
                        }}
                      >
                        <option value="">Sin categoría</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        className="w-32"
                        value={edit.unitId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEdits((prev) => ({
                            ...prev,
                            [product.barcode]: {
                              ...edit,
                              unitId: value ? Number(value) : null,
                            },
                          }));
                        }}
                      >
                        <option value="">Sin unidad</option>
                        {units?.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>{product.reportedBranchName ?? "-"}</TableCell>
                    <TableCell>{product.saleCount}</TableCell>
                    <TableCell>{formatMXN(product.totalAmount)}</TableCell>
                    <TableCell>
                      {product.createdAt ? formatHumanDate(product.createdAt.slice(0, 10)) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        color="success"
                        disabled={
                          approveMutation.isPending ||
                          !edit.name ||
                          edit.categoryId === null ||
                          edit.categoryId === undefined
                        }
                        onClick={() => handleApprove(product)}
                      >
                        Confirmar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

function ApiKeysSection() {
  const { data: keys, isLoading, isError } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const { data: branches } = useBranches();
  const [branchId, setBranchId] = useState<number | undefined>();
  const [label, setLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  if (isLoading) return <Card><p>Cargando llaves...</p></Card>;
  if (isError) return <Card><p>Error al cargar llaves</p></Card>;

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
      <h3 className="mb-4 text-lg font-semibold">Llaves de sucursal (app de reportes)</h3>

      {createdKey && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            Llave generada — cópiala ahora, no se mostrará de nuevo
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="break-all rounded bg-gray-100 px-2 py-1 text-xs">
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
                    {key.lastUsedAt ? formatHumanDate(key.lastUsedAt.slice(0, 10)) : "Nunca"}
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

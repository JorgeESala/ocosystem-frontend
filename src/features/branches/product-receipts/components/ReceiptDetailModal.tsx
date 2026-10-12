import { Alert, Badge, Button, Checkbox, Label, Modal, ModalBody, ModalHeader, Select, TextInput, Tooltip } from "flowbite-react";
import { useState } from "react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import type { ReceiptLineDTO } from "../types";
import {
  useCatalogProducts,
  useReceiptDetail,
  useRecordCost,
  useResolveLine,
  useResolveWithProduct,
} from "../api/product-receipts.queries";
import { useCategories } from "../../product/api/categories.queries";
import { useMeasurementUnits } from "../../product/api/measurementUnits.queries";
import { lineDisplayName, normalizedLineCost, unitSingular } from "../utils/receipt-cost";

interface CostForm {
  unitCost: string;
  factor: string;
}

export function CostEquivalenceHelp() {
  return (
    <span>
      Vendemos por pieza, pero el proveedor a veces da el precio por caja o
      bulto. Si el precio ya es por unidad recibida, desmarca la casilla de
      paquete.
    </span>
  );
}

function parsePositive(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function CostFormFields({
  line,
  receiptId,
}: {
  line: ReceiptLineDTO;
  receiptId: number;
}) {
  const freshForm = { unitCost: "", factor: "" };
  const [form, setForm] = useState<CostForm>(freshForm);
  const [isPackage, setIsPackage] = useState(false);
  const recordCost = useRecordCost(receiptId);
  const amount = parsePositive(form.unitCost);
  const factor = form.factor.trim() ? parsePositive(form.factor) : null;
  const factorInvalid = isPackage && (factor === null || factor <= 0);
  const valid = amount !== null && !factorInvalid;
  const preview =
    isPackage && amount !== null && factor !== null && factor > 0
      ? normalizedLineCost(line, {
          id: 0,
          unitCost: amount,
          costUnit: "paquete",
          toLineUnitFactor: factor,
          enteredBy: "",
          enteredAt: "",
        })
      : null;

  const handleSave = () => {
    if (!valid || amount === null) return;
    recordCost.mutate(
      {
        lineId: line.id,
        payload: isPackage
          ? {
              unitCost: amount,
              costUnit: "paquete",
              toLineUnitFactor: factor,
            }
          : {
              unitCost: amount,
              costUnit: line.unitName,
              toLineUnitFactor: null,
            },
      },
      {
        onSuccess: () => {
          setForm(freshForm);
          setIsPackage(false);
        },
      },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded border border-slate-700 p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label>Costo $</Label>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.unitCost}
            onChange={(e) => setForm((prev) => ({ ...prev, unitCost: e.target.value }))}
          />
        </div>
        <span className="rounded bg-slate-700 px-2 py-2 text-sm text-slate-200">
          por {isPackage ? "paquete" : unitSingular(line.unitName)}
        </span>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <Checkbox
          checked={isPackage}
          onChange={(e) => setIsPackage(e.target.checked)}
        />
        Es precio por paquete (caja/bulto)
      </label>
      {isPackage && (
        <div>
          <Label>
            ¿A cuántas unidades equivale el paquete?{" "}
            <Tooltip content={<CostEquivalenceHelp />}>
              <span className="cursor-help text-slate-400 underline">¿Qué es esto?</span>
            </Tooltip>
          </Label>
          <TextInput
            type="number"
            min="0"
            step="0.000001"
            placeholder={`Ej: 1 caja = 12 ${line.unitName}, escribe 12`}
            value={form.factor}
            onChange={(e) => setForm((prev) => ({ ...prev, factor: e.target.value }))}
          />
          <p className="text-xs text-slate-400">Recibido en {line.unitName}.</p>
        </div>
      )}
      {preview && (
        <p className="text-sm text-slate-200">
          {formatMXN(amount!)} por paquete ≈ {formatMXN(preview.amount)} por{" "}
          {preview.unit}
        </p>
      )}
      {factorInvalid && (
        <p className="text-xs text-red-400">La equivalencia debe ser mayor a cero.</p>
      )}
      {recordCost.isError && (
        <p className="text-xs text-red-400">No se pudo guardar el costo.</p>
      )}
      <Button size="xs" color="blue" disabled={!valid || recordCost.isPending} onClick={handleSave}>
        Guardar costo
      </Button>
    </div>
  );
}

function ResolveForm({ line, receiptId }: { line: ReceiptLineDTO; receiptId: number }) {
  const [query, setQuery] = useState("");
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState(line.observedName ?? line.sourceBarcode ?? "");
  const [barcode, setBarcode] = useState(line.sourceBarcode ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const resolve = useResolveLine(receiptId);
  const resolveWithProduct = useResolveWithProduct(receiptId);
  const { data: products = [] } = useCatalogProducts();
  const { data: categories = [] } = useCategories();
  const { data: units = [] } = useMeasurementUnits();

  const matches =
    query.trim() === ""
      ? []
      : products
          .filter(
            (product) =>
              product.barcode.toLowerCase().includes(query.trim().toLowerCase()) ||
              product.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .slice(0, 20);

  const startCreating = () => {
    setCreating(true);
    setSelectedBarcode(null);
    const matchingUnit = units.find(
      (unit) => unit.name.toLowerCase() === line.unitName.toLowerCase(),
    );
    if (matchingUnit && !unitId) setUnitId(String(matchingUnit.id));
  };

  const createValid =
    name.trim() !== "" && barcode.trim() !== "" && categoryId !== "" && unitId !== "";

  const handleCreate = () => {
    if (!createValid) return;
    resolveWithProduct.mutate(
      {
        lineId: line.id,
        payload: {
          productBarcode: barcode.trim(),
          name: name.trim(),
          categoryId: Number(categoryId),
          unitId: Number(unitId),
        },
      },
      {
        onSuccess: (result) => {
          setNotice(
            result.productCreated
              ? "Producto creado y vinculado."
              : "El producto ya existía; se vinculó.",
          );
          setCreating(false);
        },
      },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded border border-amber-700 p-3">
      <p className="text-xs text-amber-200">
        Busca el producto por código o nombre para vincularlo. Si no existe,
        créalo aquí mismo.
      </p>
      <div>
        <Label>Buscar producto</Label>
        <TextInput
          placeholder="Código o nombre"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedBarcode(null);
          }}
        />
      </div>
      {query.trim() !== "" && (
        <div>
          {matches.length === 0 ? (
            <p className="text-xs text-slate-400">Sin coincidencias en el catálogo.</p>
          ) : (
            <ul className="max-h-32 space-y-1 overflow-y-auto">
              {matches.map((product) => (
                <li key={product.barcode}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBarcode(product.barcode);
                      setCreating(false);
                    }}
                    className={`w-full rounded px-2 py-1 text-left text-sm ${
                      selectedBarcode === product.barcode
                        ? "bg-amber-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {product.barcode} — {product.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!creating && (
            <Button
              size="xs"
              color="light"
              className="mt-2"
              onClick={startCreating}
            >
              No es ninguno: crear producto
            </Button>
          )}
        </div>
      )}
      {selectedBarcode && !creating && (
        <Button
          size="xs"
          color="yellow"
          disabled={resolve.isPending}
          onClick={() =>
            resolve.mutate({
              lineId: line.id,
              payload: { productBarcode: selectedBarcode, toProductUnitFactor: null },
            })
          }
        >
          Vincular producto
        </Button>
      )}
      {creating && (
        <div className="space-y-2 rounded border border-slate-700 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Nombre</Label>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Código de barras</Label>
              <TextInput value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Selecciona…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Unidad</Label>
              <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                <option value="">Selecciona…</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {resolveWithProduct.isError && (
            <p className="text-xs text-red-400">No se pudo crear el producto.</p>
          )}
          <Button
            size="xs"
            color="yellow"
            disabled={!createValid || resolveWithProduct.isPending}
            onClick={handleCreate}
          >
            Crear y vincular
          </Button>
        </div>
      )}
      {resolve.isError && (
        <p className="text-xs text-red-400">No se pudo vincular. Verifica el código.</p>
      )}
      {notice && <p className="text-xs text-green-400">{notice}</p>}
    </div>
  );
}

export default function ReceiptDetailModal({
  receiptId,
  onClose,
}: {
  receiptId: number;
  onClose: () => void;
}) {
  const { data: receipt, isLoading, isError } = useReceiptDetail(receiptId);

  return (
    <Modal show onClose={onClose} size="4xl">
      <ModalHeader>Recepción #{receiptId}</ModalHeader>
      <ModalBody>
        {isLoading && <p className="text-sm text-slate-400">Cargando recepción...</p>}
        {isError && (
          <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
            No se pudo cargar la recepción.
          </Alert>
        )}
        {receipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 md:grid-cols-4">
              <div>
                <span className="text-slate-500">Sucursal: </span>
                {receipt.branchName}
              </div>
              <div>
                <span className="text-slate-500">Recibido: </span>
                {formatHumanDate(receipt.receivedAt.slice(0, 10))}
              </div>
              <div>
                <span className="text-slate-500">Quien recibe: </span>
                {receipt.recorderName}
              </div>
              <div>
                <span className="text-slate-500">Registrado: </span>
                {formatHumanDate(receipt.createdAt.slice(0, 10))}
              </div>
            </div>
            {receipt.lines.map((line) => {
              const normalized = line.latestCost
                ? normalizedLineCost(line, line.latestCost)
                : null;
              return (
                <div key={line.id} className="rounded border border-slate-700 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{lineDisplayName(line)}</span>
                    {line.productBarcode === null && <Badge color="warning">Sin resolver</Badge>}
                    {line.latestCost === null ? (
                      <Badge color="gray">Sin costo</Badge>
                    ) : (
                      <Badge color="success">
                        {formatMXN(line.latestCost.unitCost)} por {line.latestCost.costUnit}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Recibido: {line.quantity} {line.unitName}
                    {line.sourceBarcode && ` · Código: ${line.sourceBarcode}`}
                    {line.toProductUnitFactor &&
                      ` · Equivalencia: ${line.toProductUnitFactor}`}
                    {normalized &&
                      ` · Costo: ${formatMXN(normalized.amount)} por ${normalized.unit}`}
                    {line.latestCost && !normalized && " · Costo sin equivalencia base"}
                  </p>
                  {line.productBarcode === null && (
                    <ResolveForm line={line} receiptId={receipt.id} />
                  )}
                  <CostFormFields line={line} receiptId={receipt.id} />
                  {line.costHistory.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      <p className="font-medium">Historial de costos:</p>
                      <ul className="list-disc pl-5">
                        {line.costHistory.map((cost) => (
                          <li key={cost.id}>
                            {formatMXN(cost.unitCost)} por {cost.costUnit} · {cost.enteredBy} ·{" "}
                            {formatHumanDate(cost.enteredAt.slice(0, 10))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}

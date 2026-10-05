import { Alert, Badge, Button, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";
import { useState } from "react";
import { formatMXN } from "@/utils/moneyNumbers";
import { formatHumanDate } from "@/utils/date.utils";
import type { ReceiptLineDTO } from "../types";
import { useReceiptDetail, useRecordCost, useResolveLine } from "../api/product-receipts.queries";
import { lineDisplayName, normalizedLineCost } from "../utils/receipt-cost";

interface CostForm {
  unitCost: string;
  costUnit: string;
  factor: string;
}

const emptyCostForm: CostForm = { unitCost: "", costUnit: "", factor: "" };

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
  const [form, setForm] = useState<CostForm>(emptyCostForm);
  const recordCost = useRecordCost(receiptId);
  const amount = parsePositive(form.unitCost);
  const factor = form.factor.trim() ? parsePositive(form.factor) : null;
  const factorInvalid = form.factor.trim() !== "" && (factor === null || factor <= 0);
  const valid = amount !== null && form.costUnit.trim() !== "" && !factorInvalid;

  const handleSave = () => {
    if (!valid || amount === null) return;
    recordCost.mutate(
      {
        lineId: line.id,
        payload: {
          unitCost: amount,
          costUnit: form.costUnit.trim(),
          toLineUnitFactor: factor,
        },
      },
      { onSuccess: () => setForm(emptyCostForm) },
    );
  };

  return (
    <div className="mt-2 space-y-2 rounded border border-slate-700 p-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Costo unitario</Label>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.unitCost}
            onChange={(e) => setForm((prev) => ({ ...prev, unitCost: e.target.value }))}
          />
        </div>
        <div>
          <Label>Unidad del costo</Label>
          <TextInput
            placeholder="Kilo"
            value={form.costUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, costUnit: e.target.value }))}
          />
        </div>
        <div>
          <Label>Equivalencia (opcional)</Label>
          <TextInput
            type="number"
            min="0"
            step="0.000001"
            placeholder="Unidades por costo"
            value={form.factor}
            onChange={(e) => setForm((prev) => ({ ...prev, factor: e.target.value }))}
          />
        </div>
      </div>
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
  const [barcode, setBarcode] = useState("");
  const [factor, setFactor] = useState("");
  const resolve = useResolveLine(receiptId);
  const parsedFactor = factor.trim() ? parsePositive(factor) : null;
  const valid = barcode.trim() !== "" && (factor.trim() === "" || (parsedFactor !== null && parsedFactor > 0));

  return (
    <div className="mt-2 space-y-2 rounded border border-amber-700 p-3">
      <p className="text-xs text-amber-200">
        Línea sin resolver: vincúlala a un producto del catálogo.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Código del producto</Label>
          <TextInput
            placeholder="Código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>
        <div>
          <Label>Equivalencia (opcional)</Label>
          <TextInput
            type="number"
            min="0"
            step="0.000001"
            placeholder="A unidad del producto"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
          />
        </div>
      </div>
      {resolve.isError && (
        <p className="text-xs text-red-400">No se pudo vincular. Verifica el código.</p>
      )}
      <Button
        size="xs"
        color="warning"
        disabled={!valid || resolve.isPending}
        onClick={() =>
          resolve.mutate({
            lineId: line.id,
            payload: { productBarcode: barcode.trim(), toProductUnitFactor: parsedFactor },
          })
        }
      >
        Vincular producto
      </Button>
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

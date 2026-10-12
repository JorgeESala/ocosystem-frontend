import { Alert, Badge, Button, Checkbox, Datepicker, Label, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { useState } from "react";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { formatHumanDate } from "@/utils/date.utils";
import type { ReceiptFilters } from "../types";
import { useProductReceipts } from "../api/product-receipts.queries";
import ReceiptDetailModal from "../components/ReceiptDetailModal";

const toLocalIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);
  return { from, to };
};

const defaultFilters = (): ReceiptFilters => {
  const { from, to } = defaultRange();
  return {
    branchIds: [],
    from: toLocalIso(from),
    to: toLocalIso(to),
    pendingCostOnly: false,
    unresolvedOnly: false,
  };
};

export default function ProductReceiptsPage() {
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [from, setFrom] = useState<Date | null>(() => defaultRange().from);
  const [to, setTo] = useState<Date | null>(() => defaultRange().to);
  const [pendingCostOnly, setPendingCostOnly] = useState(false);
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ReceiptFilters>(defaultFilters);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  const receiptsQuery = useProductReceipts(activeFilters);
  const receipts = receiptsQuery.data ?? [];

  const handleSearch = () => {
    if (!from || !to) return;
    setActiveFilters({
      branchIds: selectedBranchIds,
      from: toLocalIso(from),
      to: toLocalIso(to),
      pendingCostOnly,
      unresolvedOnly,
    });
  };

  const handleClear = () => {
    const { from: defaultFrom, to: defaultTo } = defaultRange();
    setSelectedBranchIds([]);
    setFrom(defaultFrom);
    setTo(defaultTo);
    setPendingCostOnly(false);
    setUnresolvedOnly(false);
    setActiveFilters(defaultFilters());
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Recepción de productos</h1>
        <p className="text-sm text-slate-400">
          Cantidades recibidas por sucursal y costo de compra capturado por línea.
        </p>
      </header>

      <div className="grid gap-3 rounded border border-slate-800 p-4 md:grid-cols-4">
        <BranchMultiSelect
          branches={branches}
          selected={selectedBranchIds}
          onChange={setSelectedBranchIds}
        />
        <div>
          <Label>Desde</Label>
          <Datepicker language="es-MX" value={from} onChange={setFrom} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Datepicker language="es-MX" value={to} onChange={setTo} />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <Checkbox
              checked={pendingCostOnly}
              onChange={(e) => setPendingCostOnly(e.target.checked)}
            />
            Sin costo
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <Checkbox
              checked={unresolvedOnly}
              onChange={(e) => setUnresolvedOnly(e.target.checked)}
            />
            Sin resolver
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch}>Buscar</Button>
        <Button color="light" onClick={handleClear}>
          Limpiar
        </Button>
      </div>

      {receiptsQuery.isLoading || loadingBranches ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : receiptsQuery.isError ? (
        <Alert color="failure" className="border border-red-900/40 bg-red-950/40">
          No se pudieron cargar las recepciones.
        </Alert>
      ) : receipts.length === 0 ? (
        <p className="text-sm text-slate-400">No hay recepciones en el rango seleccionado.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>ID</TableHeadCell>
              <TableHeadCell>Sucursal</TableHeadCell>
              <TableHeadCell>Recibido</TableHeadCell>
              <TableHeadCell>Quien recibe</TableHeadCell>
              <TableHeadCell>Líneas</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
            </TableHead>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow
                  key={receipt.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedReceiptId(receipt.id)}
                >
                  <TableCell>#{receipt.id}</TableCell>
                  <TableCell>{receipt.branchName}</TableCell>
                  <TableCell>{formatHumanDate(receipt.receivedAt.slice(0, 10))}</TableCell>
                  <TableCell>{receipt.recorderName}</TableCell>
                  <TableCell>{receipt.lineCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {receipt.pendingCostCount > 0 && (
                        <Badge color="gray">Sin costo ({receipt.pendingCostCount})</Badge>
                      )}
                      {receipt.pendingCostCount === 0 && <Badge color="success">Con costo</Badge>}
                      {receipt.unresolvedCount > 0 && (
                        <Badge color="warning">Sin resolver ({receipt.unresolvedCount})</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedReceiptId !== null && (
        <ReceiptDetailModal
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
        />
      )}
    </div>
  );
}

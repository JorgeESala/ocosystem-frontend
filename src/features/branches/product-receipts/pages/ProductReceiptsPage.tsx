import { Alert, Badge, Button, Checkbox, Label, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useState } from "react";
import BranchMultiSelect from "@/components/BranchMultiSelect";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { formatHumanDate } from "@/utils/date.utils";
import type { ReceiptFilters } from "../types";
import { useProductReceipts } from "../api/product-receipts.queries";
import ReceiptDetailModal from "../components/ReceiptDetailModal";

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ProductReceiptsPage() {
  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(todayIso());
  const [pendingCostOnly, setPendingCostOnly] = useState(true);
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ReceiptFilters | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  const receiptsQuery = useProductReceipts(activeFilters);
  const receipts = receiptsQuery.data ?? [];

  const handleSearch = () => {
    if (!from || !to) return;
    setActiveFilters({
      branchIds: selectedBranchIds,
      from,
      to,
      pendingCostOnly,
      unresolvedOnly,
    });
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
          <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
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
        <Button
          color="light"
          onClick={() => {
            setSelectedBranchIds([]);
            setFrom(todayIso());
            setTo(todayIso());
            setPendingCostOnly(true);
            setUnresolvedOnly(false);
            setActiveFilters(null);
          }}
        >
          Limpiar
        </Button>
      </div>

      {!activeFilters ? (
        <p className="text-sm text-slate-400">
          Selecciona el rango de fechas y presiona Buscar para ver las recepciones.
        </p>
      ) : receiptsQuery.isLoading || loadingBranches ? (
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

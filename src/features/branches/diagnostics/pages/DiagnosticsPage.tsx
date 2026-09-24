import { useState } from "react";
import {
  Badge,
  Button,
  Datepicker,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useDiagnosticDetail, useDiagnostics } from "../api/diagnostics.queries";
import type { DiagnosticFilters, DiagnosticItemDTO } from "../types";

const LEVEL_OPTIONS = [
  { value: "", label: "Todos los niveles" },
  { value: "ERROR", label: "Error" },
  { value: "WARN", label: "Aviso" },
  { value: "INFO", label: "Info" },
];

const toIsoDate = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;

const daysAgo = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("es-MX");
};

const levelColor = (level: string) => {
  if (level === "ERROR") {
    return "failure";
  }
  if (level === "WARN") {
    return "warning";
  }
  return "info";
};

export default function DiagnosticsPage() {
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [from, setFrom] = useState<Date>(daysAgo(6));
  const [to, setTo] = useState<Date>(new Date());
  const [applied, setApplied] = useState<DiagnosticFilters>(() => ({
    branchId: undefined,
    level: undefined,
    from: toIsoDate(daysAgo(6)),
    to: toIsoDate(new Date()),
    page: 0,
    size: 20,
  }));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const query = useDiagnostics(applied);
  const detail = useDiagnosticDetail(selectedId);
  const items: DiagnosticItemDTO[] = query.data?.content ?? [];

  const handleSearch = () => {
    setApplied({
      branchId: branchId === "" ? undefined : Number(branchId),
      level: level === "" ? undefined : level,
      from: toIsoDate(from),
      to: toIsoDate(to),
      page: 0,
      size: 20,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Diagnóstico</h1>
        <p className="text-sm text-slate-400">
          Errores y eventos reportados por la app de sucursal.
        </p>
      </header>

      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-5">
        <div>
          <Label htmlFor="diagnostic-branch">Sucursal</Label>
          <Select
            id="diagnostic-branch"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
          >
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="diagnostic-level">Nivel</Label>
          <Select
            id="diagnostic-level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="diagnostic-from">Desde</Label>
          <Datepicker
            id="diagnostic-from"
            language="es-MX"
            value={from}
            onChange={(value) => value && setFrom(value)}
          />
        </div>
        <div>
          <Label htmlFor="diagnostic-to">Hasta</Label>
          <Datepicker
            id="diagnostic-to"
            language="es-MX"
            value={to}
            onChange={(value) => value && setTo(value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={query.isFetching}>
            Buscar
          </Button>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-slate-800">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Recibido</TableHeadCell>
              <TableHeadCell>Sucursal</TableHeadCell>
              <TableHeadCell>Nivel</TableHeadCell>
              <TableHeadCell>App</TableHeadCell>
              <TableHeadCell>Evento</TableHeadCell>
              <TableHeadCell>Mensaje</TableHeadCell>
              <TableHeadCell>Veces</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => setSelectedId(item.id)}
              >
                <TableCell>{formatDateTime(item.receivedAt)}</TableCell>
                <TableCell>{item.branchName}</TableCell>
                <TableCell>
                  <Badge color={levelColor(item.level)}>{item.level}</Badge>
                </TableCell>
                <TableCell>{item.appVersion ?? ""}</TableCell>
                <TableCell>{item.event ?? ""}</TableCell>
                <TableCell>{item.message ?? ""}</TableCell>
                <TableCell>{item.occurrences}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            {query.isLoading
              ? "Cargando..."
              : "Sin diagnósticos en el rango seleccionado."}
          </p>
        )}
      </section>

      <Modal
        show={selectedId != null}
        size="3xl"
        onClose={() => setSelectedId(null)}
      >
        <ModalHeader>Detalle del diagnóstico</ModalHeader>
        <ModalBody>
          {detail.data ? (
            <div className="space-y-4 text-sm text-slate-200">
              <div className="grid gap-2 md:grid-cols-2">
                <p>
                  <span className="text-slate-400">Sucursal: </span>
                  {detail.data.branchName}
                </p>
                <p>
                  <span className="text-slate-400">Nivel: </span>
                  {detail.data.level}
                </p>
                <p>
                  <span className="text-slate-400">App: </span>
                  {detail.data.appVersion ?? ""}
                </p>
                <p>
                  <span className="text-slate-400">Evento: </span>
                  {detail.data.event ?? ""}
                </p>
                <p>
                  <span className="text-slate-400">Primera vez: </span>
                  {formatDateTime(detail.data.occurredAt)}
                </p>
                <p>
                  <span className="text-slate-400">Última vez: </span>
                  {formatDateTime(detail.data.lastSeenAt)}
                </p>
                <p>
                  <span className="text-slate-400">Veces: </span>
                  {detail.data.occurrences}
                </p>
              </div>
              <p>
                <span className="text-slate-400">Mensaje: </span>
                {detail.data.message ?? ""}
              </p>
              {detail.data.context && (
                <div>
                  <p className="mb-1 text-slate-400">Contexto</p>
                  <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs">
                    {JSON.stringify(detail.data.context, null, 2)}
                  </pre>
                </div>
              )}
              {detail.data.stacktrace && (
                <div>
                  <p className="mb-1 text-slate-400">Detalle técnico</p>
                  <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs">
                    {detail.data.stacktrace}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Cargando...</p>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

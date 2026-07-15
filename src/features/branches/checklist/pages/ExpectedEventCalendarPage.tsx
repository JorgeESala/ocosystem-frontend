import { useMemo, useState } from "react";
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Select, Spinner, TextInput, Textarea } from "flowbite-react";
import { HiPlus, HiTrash, HiCalendar } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import { useBranches } from "@/features/branches/branch/branch.queries";
import { useAuthRole } from "@/hooks/useAuthRole";
import {
  useCreateExpectedEvent,
  useCreateExpectedEventsBulk,
  useDeleteExpectedEvent,
  useExpectedEvents,
} from "../api/expected-events.queries";
import {
  useScheduleTemplates,
  useCreateScheduleTemplate,
  useDeleteScheduleTemplate,
} from "../api/schedule-templates.queries";
import { fromIsoDateString, toIsoDateString } from "../utils/week";
import { EXPECTED_EVENT_LABELS, type ExpectedEvent, type ExpectedEventType } from "../types/expected-event.types";
import { DAY_OF_WEEK_LABELS } from "../types/schedule-template.types";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_OPTIONS: { value: ExpectedEventType; label: string }[] = (
  Object.entries(EXPECTED_EVENT_LABELS) as [ExpectedEventType, string][]
).map(([value, label]) => ({ value, label }));

const TYPE_TONE: Record<ExpectedEventType, string> = {
  EXPENSE: "bg-rose-900/30 text-rose-300 ring-1 ring-rose-700/40",
  BATCH_RECEPTION: "bg-amber-900/30 text-amber-300 ring-1 ring-amber-700/40",
  SALES_REPORT: "bg-blue-900/30 text-blue-300 ring-1 ring-blue-700/40",
  AP_REVIEW: "bg-purple-900/30 text-purple-300 ring-1 ring-purple-700/40",
};

export default function ExpectedEventCalendarPage() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const { isAdmin } = useAuthRole();
  const { data: branches = [], isLoading: loadingBranches } = useBranches();

  const [singleModal, setSingleModal] = useState<{ open: boolean; branchId?: number; date?: string }>(
    { open: false },
  );
  const [bulkModal, setBulkModal] = useState<{ open: boolean; branchId?: number }>(
    { open: false },
  );

  const today = useMemo(() => new Date(), []);
  const from = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return d;
  }, [today]);
  const to = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 28);
    return d;
  }, [today]);

  const { data: events = [], isLoading: loadingEvents } = useExpectedEvents({
    from: toIsoDateString(from),
    to: toIsoDateString(to),
  });

  const { data: allTemplates = [] } = useScheduleTemplates();

  const createSingle = useCreateExpectedEvent();
  const createBulk = useCreateExpectedEventsBulk();
  const deleteEvent = useDeleteExpectedEvent();

  const eventsByBranchAndDate = useMemo(() => {
    const map = new Map<string, ExpectedEvent>();
    for (const e of events) {
      map.set(`${e.branchId}|${e.eventDate}`, e);
    }
    return map;
  }, [events]);

  const templatesByBranchId = useMemo(() => {
    const map = new Map<number, typeof allTemplates>();
    for (const t of allTemplates) {
      const list = map.get(t.branchId) ?? [];
      list.push(t);
      map.set(t.branchId, list);
    }
    return map;
  }, [allTemplates]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      arr.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return arr;
  }, [from, to]);

  if (loadingBranches) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Calendario de fechas esperadas</h1>
          <p className="text-sm text-slate-400">
            Registra las fechas en que cada sucursal debe subir gastos, recibir lotes, etc.
            El resultado diario se evalúa solo en esas fechas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/business/${slug}/checklist`}>
            <Button color="light">
              <HiCalendar aria-hidden className="mr-2 h-4 w-4" />
              Ver checklist
            </Button>
          </Link>
        </div>
      </header>

      {branches.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
          No hay sucursales registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch) => (
            <section
              key={branch.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/60"
            >
              <header className="flex flex-col gap-2 border-b border-slate-800/80 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{branch.name}</h2>
                  <p className="text-xs text-slate-400">
                    {events.filter((e) => e.branchId === branch.id).length} fechas registradas
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && (
                    <>
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => setBulkModal({ open: true, branchId: branch.id })}
                      >
                        <HiPlus aria-hidden className="mr-1 h-3 w-3" />
                        Repetir
                      </Button>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() =>
                          setSingleModal({
                            open: true,
                            branchId: branch.id,
                            date: toIsoDateString(today),
                          })
                        }
                      >
                        <HiPlus aria-hidden className="mr-1 h-3 w-3" />
                        Agregar fecha
                      </Button>
                    </>
                  )}
                </div>
              </header>
              <div className="border-b border-slate-800/80 p-4">
                <TemplateSection branchId={branch.id} />
              </div>
              <div className="overflow-x-auto p-4">
                {loadingEvents ? (
                  <div className="flex justify-center py-6">
                    <Spinner size="md" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 min-w-[640px]">
                    {days.map((d) => {
                      const key = `${branch.id}|${toIsoDateString(d)}`;
                      const event = eventsByBranchAndDate.get(key);
                      const dayOfWeek = d.getDay();
                      const branchTemplates = templatesByBranchId.get(branch.id) ?? [];
                      const templateEvent = !event
                        ? branchTemplates.find((t) => t.dayOfWeek === dayOfWeek)
                        : null;
                      return (
                        <div
                          key={key}
                          className="flex flex-col items-center gap-1 rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-center text-[11px]"
                        >
                          <div className="text-slate-400">
                            {d.toLocaleDateString("es-MX", { weekday: "short" })}
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {d.getDate()}
                          </div>
                          {event ? (
                            <div className={`mt-1 w-full rounded px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_TONE[event.eventType]}`}>
                              {EXPECTED_EVENT_LABELS[event.eventType]}
                              {event.cutoffTime && (
                                <div className="text-[9px] opacity-80">
                                  {event.cutoffTime}
                                </div>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="ml-1 text-rose-200 hover:text-rose-100"
                                  onClick={() => event.id != null && deleteEvent.mutate(event.id)}
                                  aria-label="Eliminar"
                                >
                                  <HiTrash aria-hidden className="inline h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ) : templateEvent ? (
                            <div className={`mt-1 w-full rounded border border-dashed px-1.5 py-0.5 text-[10px] font-semibold opacity-60 ${TYPE_TONE[templateEvent.eventType]}`}>
                              {EXPECTED_EVENT_LABELS[templateEvent.eventType]}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <SingleEventModal
        open={singleModal.open}
        onClose={() => setSingleModal({ open: false })}
        branchId={singleModal.branchId ?? branches[0]?.id}
        initialDate={singleModal.date}
        onCreated={() => {
          setSingleModal({ open: false });
          qc.invalidateQueries({ queryKey: ["branch-expected-events"] });
        }}
      />

      <BulkEventModal
        open={bulkModal.open}
        onClose={() => setBulkModal({ open: false })}
        branchId={bulkModal.branchId ?? branches[0]?.id}
        onCreated={() => {
          setBulkModal({ open: false });
          qc.invalidateQueries({ queryKey: ["branch-expected-events"] });
        }}
      />

      {createSingle.isError && (
        <Alert color="failure">
          No se pudo crear el evento: {(createSingle.error as Error)?.message ?? "error"}
        </Alert>
      )}
      {createBulk.isError && (
        <Alert color="failure">
          No se pudo crear el bloque: {(createBulk.error as Error)?.message ?? "error"}
        </Alert>
      )}
    </div>
  );
}

function TemplateSection({ branchId }: { branchId: number }) {
  const { isAdmin } = useAuthRole();
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState<ExpectedEventType>("BATCH_RECEPTION");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [cutoffTime, setCutoffTime] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: templates = [] } = useScheduleTemplates(branchId);
  const createTemplate = useCreateScheduleTemplate();
  const deleteTemplate = useDeleteScheduleTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplate.mutate(
      { branchId, eventType, dayOfWeek, cutoffTime: cutoffTime || null, note: note || null },
      {
        onSuccess: () => {
          setShowForm(false);
          setEventType("BATCH_RECEPTION");
          setDayOfWeek(1);
          setCutoffTime("");
          setNote("");
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Rutinas
        </h3>
        {isAdmin && (
          <Button size="xs" color="light" onClick={() => setShowForm(!showForm)}>
            <HiPlus className="mr-1 h-3 w-3" />
            {showForm ? "Cancelar" : "Agregar rutina"}
          </Button>
        )}
      </div>

      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${TYPE_TONE[t.eventType]}`}
            >
              <span>{DAY_OF_WEEK_LABELS[t.dayOfWeek]}</span>
              <span className="opacity-60">·</span>
              <span>{EXPECTED_EVENT_LABELS[t.eventType]}</span>
              {t.cutoffTime && (
                <span className="opacity-60">· {t.cutoffTime}</span>
              )}
              {isAdmin && (
                <button
                  type="button"
                  className="ml-1 text-rose-200 hover:text-rose-100"
                  onClick={() => t.id != null && deleteTemplate.mutate(t.id)}
                >
                  <HiTrash className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {templates.length === 0 && !showForm && (
        <p className="text-xs text-slate-500">
          Sin rutinas. Las tareas se evaluarán solo en fechas creadas manualmente.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ExpectedEventType)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="text-xs">Día</Label>
            <Select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {DAY_OF_WEEK_LABELS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="text-xs">Hora límite</Label>
            <TextInput
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Nota</Label>
            <TextInput
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <Button type="submit" size="xs" color="blue" disabled={createTemplate.isPending}>
            Guardar
          </Button>
        </form>
      )}
    </div>
  );
}

function SingleEventModal({
  open,
  onClose,
  branchId,
  initialDate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  branchId?: number;
  initialDate?: string;
  onCreated: () => void;
}) {
  const [eventType, setEventType] = useState<ExpectedEventType>("EXPENSE");
  const [date, setDate] = useState<string>(initialDate ?? toIsoDateString(new Date()));
  const [cutoffTime, setCutoffTime] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const create = useCreateExpectedEvent();

  return (
    <Modal show={open} onClose={onClose} size="md">
      <ModalHeader>Agregar fecha esperada</ModalHeader>
      <ModalBody>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!branchId) return;
            create.mutate(
              {
                branchId,
                eventType,
                eventDate: date,
                cutoffTime: cutoffTime || null,
                note: note || null,
              },
              { onSuccess: onCreated },
            );
          }}
        >
          <div>
            <Label>Tipo</Label>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ExpectedEventType)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Fecha</Label>
            <TextInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Hora límite (opcional)</Label>
            <TextInput
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Nota (opcional)</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button color="gray" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" color="blue" disabled={create.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

function BulkEventModal({
  open,
  onClose,
  branchId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  branchId?: number;
  onCreated: () => void;
}) {
  const [eventType, setEventType] = useState<ExpectedEventType>("BATCH_RECEPTION");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [weeks, setWeeks] = useState<number>(4);
  const [cutoffTime, setCutoffTime] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const create = useCreateExpectedEventsBulk();

  const previewDates = useMemo(() => {
    const today = new Date();
    const out: string[] = [];
    for (let w = 0; w < weeks; w++) {
      const d = new Date(today);
      const currentDay = d.getDay();
      const diff = (dayOfWeek - currentDay + 7) % 7;
      d.setDate(d.getDate() + diff + w * 7);
      out.push(toIsoDateString(d));
    }
    return out;
  }, [dayOfWeek, weeks]);

  const dayLabel = (() => {
    const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return names[dayOfWeek];
  })();

  return (
    <Modal show={open} onClose={onClose} size="md">
      <ModalHeader>Repetir cada {dayLabel}</ModalHeader>
      <ModalBody>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!branchId) return;
            create.mutate(
              {
                branchId,
                eventType,
                dates: previewDates,
                cutoffTime: cutoffTime || null,
                note: note || null,
              },
              { onSuccess: onCreated },
            );
          }}
        >
          <div>
            <Label>Tipo</Label>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ExpectedEventType)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Día de la semana</Label>
              <Select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
              >
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
                <option value={6}>Sábado</option>
                <option value={0}>Domingo</option>
              </Select>
            </div>
            <div>
              <Label>Semanas</Label>
              <TextInput
                type="number"
                min={1}
                max={26}
                value={weeks}
                onChange={(e) => setWeeks(Math.max(1, Math.min(26, Number(e.target.value) || 1)))}
              />
            </div>
          </div>
          <div>
            <Label>Hora límite (opcional)</Label>
            <TextInput
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Nota (opcional)</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-xs text-slate-300">
            <p className="mb-1 font-semibold">Vista previa ({previewDates.length} fechas):</p>
            <div className="flex flex-wrap gap-1">
              {previewDates.map((d) => {
                const date = fromIsoDateString(d);
                return (
                  <span
                    key={d}
                    className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-200"
                  >
                    {date.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short" })}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button color="gray" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" color="blue" disabled={create.isPending}>
              Crear {previewDates.length} fecha{previewDates.length === 1 ? "" : "s"}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

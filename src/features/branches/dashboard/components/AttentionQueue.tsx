import { useMemo, useState } from "react";
import { Button, Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiChevronDown,
  HiChevronUp,
  HiExclamationCircle,
} from "react-icons/hi";
import type {
  AttentionGroup,
  AttentionItem,
  AttentionSeverity,
  GroupLinkContext,
} from "../utils/attention";
import {
  MAX_VISIBLE_ATTENTION_ITEMS,
  groupAttentionItems,
} from "../utils/attention";

interface Props {
  items: AttentionItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  previewLimit?: number;
  linkContext?: GroupLinkContext;
}

const SEVERITY_META: Record<
  AttentionSeverity,
  { label: string; className: string }
> = {
  critical: {
    label: "Crítico",
    className: "bg-rose-900/50 text-rose-200 ring-rose-700/60",
  },
  warning: {
    label: "Atención",
    className: "bg-amber-900/50 text-amber-200 ring-amber-700/60",
  },
  info: {
    label: "Informativo",
    className: "bg-slate-800/70 text-slate-300 ring-slate-700/60",
  },
};

const AttentionRow = ({ item }: { item: AttentionItem }) => {
  const meta = SEVERITY_META[item.severity];
  return (
    <li className="flex flex-col gap-2 rounded-xl bg-slate-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ${meta.className}`}
          >
            {meta.label}
          </span>
          <span className="text-sm font-semibold text-white">
            {item.branchName}
          </span>
          <span className="text-xs text-slate-400">{item.title}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
      </div>
      {item.to && (
        <Link
          to={item.to}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-400 transition hover:gap-2"
        >
          Atender
          <HiArrowRight className="h-3 w-3" />
        </Link>
      )}
    </li>
  );
};

const GroupSummary = ({ group }: { group: AttentionGroup }) => {
  const meta = SEVERITY_META[group.severity];
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ${meta.className}`}
        >
          {meta.label}
        </span>
        <span className="text-sm font-semibold text-white">{group.title}</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{group.detail}</p>
    </div>
  );
};

const GroupActionLink = ({ to }: { to: string | null }) =>
  to ? (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-400 transition hover:gap-2"
    >
      Atender
      <HiArrowRight className="h-3 w-3" />
    </Link>
  ) : null;

const GroupRow = ({ group }: { group: AttentionGroup }) => (
  <li className="flex flex-col gap-2 rounded-xl bg-slate-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <GroupSummary group={group} />
    <GroupActionLink to={group.to} />
  </li>
);

const DrawerGroup = ({
  group,
  expanded,
  onToggle,
}: {
  group: AttentionGroup;
  expanded: boolean;
  onToggle: () => void;
}) => {
  if (group.items.length === 1) {
    return <AttentionRow item={group.items[0]} />;
  }

  return (
    <li className="rounded-xl bg-slate-950/50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <GroupSummary group={group} />
        <div className="flex shrink-0 items-center gap-1">
          <GroupActionLink to={group.to} />
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={
              expanded
                ? "Ocultar sucursales"
                : `Ver ${group.items.length} sucursales`
            }
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            {expanded ? (
              <HiChevronUp className="h-4 w-4" />
            ) : (
              <HiChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {expanded && (
        <ul className="mt-2 space-y-2 border-t border-slate-800 pt-2">
          {group.items.map((entry) => (
            <AttentionRow key={entry.id} item={entry} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function AttentionQueue({
  items,
  isLoading = false,
  isError = false,
  onRetry,
  previewLimit = MAX_VISIBLE_ATTENTION_ITEMS,
  linkContext,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const groups = useMemo(
    () => groupAttentionItems(items, linkContext),
    [items, linkContext],
  );

  if (isError) {
    return (
      <section className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-5">
        <div className="flex items-start gap-3">
          <HiExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-100">
              No se pudieron cargar las alertas del dashboard.
            </p>
            <p className="mt-1 text-xs text-rose-200/80">
              Algunas fuentes no respondieron. Intenta de nuevo para revisar
              tareas, reportes y conciliación.
            </p>
          </div>
          {onRetry && (
            <Button size="xs" color="failure" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      </section>
    );
  }

  const toggleGroup = (key: string) => {
    setExpandedKeys((previous) =>
      previous.includes(key)
        ? previous.filter((entry) => entry !== key)
        : [...previous, key],
    );
  };

  const visibleGroups = groups.slice(0, previewLimit);
  const remainingGroups = groups.length - visibleGroups.length;
  const criticalCount = items.filter(
    (entry) => entry.severity === "critical",
  ).length;

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Necesita atención
        </h2>
        {isLoading ? (
          <span className="text-xs text-slate-500">Cargando…</span>
        ) : (
          criticalCount > 0 && (
            <span className="text-xs font-semibold text-rose-300">
              {criticalCount} críticas
            </span>
          )
        )}
      </div>

      {isLoading && items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Cargando pendientes…
        </p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Sin pendientes por atender
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {visibleGroups.map((group) =>
              group.items.length === 1 ? (
                <AttentionRow key={group.key} item={group.items[0]} />
              ) : (
                <GroupRow key={group.key} group={group} />
              ),
            )}
          </ul>
          {remainingGroups > 0 && (
            <div className="mt-3 flex justify-end">
              <Button
                size="xs"
                color="gray"
                onClick={() => setDrawerOpen(true)}
              >
                Ver todas ({remainingGroups})
              </Button>
            </div>
          )}
        </>
      )}

      {drawerOpen && (
        <Drawer
          open
          onClose={() => setDrawerOpen(false)}
          position="right"
          className="w-full max-w-xl bg-slate-900"
        >
          <DrawerHeader title="Necesita atención" />
          <DrawerItems>
            <div className="max-h-[70vh] overflow-y-auto">
              <ul className="space-y-2">
                {groups.map((group) => (
                  <DrawerGroup
                    key={group.key}
                    group={group}
                    expanded={expandedKeys.includes(group.key)}
                    onToggle={() => toggleGroup(group.key)}
                  />
                ))}
              </ul>
            </div>
          </DrawerItems>
        </Drawer>
      )}
    </section>
  );
}

import { Badge } from "flowbite-react";
import { formatLongDate } from "@/utils/notificationDates";
import type { ChecklistDetail } from "../types";

const STATUS_CONFIG: Record<
  string,
  { color: "green" | "red" | "gray"; label: string }
> = {
  DONE: { color: "green", label: "Completado" },
  EMPTY: { color: "red", label: "Pendiente" },
  NOT_APPLICABLE: { color: "gray", label: "No aplica" },
};

export function ChecklistDetailContent({ detail }: { detail: unknown }) {
  const d = detail as ChecklistDetail;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-white">
        Checklist del {formatLongDate(d.date)}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-400">
          {d.completedTasks} de {d.totalTasks} tareas completadas
        </p>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-green-500"
            style={{
              width: `${d.totalTasks > 0 ? (d.completedTasks / d.totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {d.tasks.map((t) => {
          const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.NOT_APPLICABLE;
          return (
            <div
              key={t.taskId}
              className="flex items-start gap-3 rounded border border-gray-700 bg-gray-800 p-3"
            >
              <Badge color={cfg.color} className="mt-0.5 shrink-0">
                {cfg.label}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-xs text-gray-400">{t.detail}</p>
                {t.late && (
                  <Badge color="red" className="mt-1">
                    Tarde
                  </Badge>
                )}
                {t.optional && (
                  <Badge color="gray" className="mt-1">
                    Opcional
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

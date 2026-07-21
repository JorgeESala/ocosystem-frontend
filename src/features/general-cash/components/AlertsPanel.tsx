import type { CashReserveAlertDTO } from "../types";

interface Props {
  alerts: CashReserveAlertDTO[];
}

export default function AlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl bg-slate-800 p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Alertas</h3>
        <p className="text-sm text-slate-400">No hay alertas activas</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Alertas Activas ({alerts.length})
      </h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 ${
              alert.severity === "critical"
                ? "border border-red-700 bg-red-900/30"
                : "border border-yellow-700 bg-yellow-900/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {alert.severity === "critical" ? "\u{1F534}" : "\u{1F7E1}"}
              </span>
              <span className="font-semibold text-white">
                {alert.branchName}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

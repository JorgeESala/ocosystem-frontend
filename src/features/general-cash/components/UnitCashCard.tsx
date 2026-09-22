import type { UnitCashAccountDTO } from "../types.unit";

interface Props {
  name: string;
  account: UnitCashAccountDTO;
}

export default function UnitCashCard({ name, account }: Props) {
  const change = account.currentBalance - account.startingBalance;
  const changePercent =
    account.startingBalance !== 0
      ? (change / account.startingBalance) * 100
      : 0;
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl bg-slate-800 p-6">
      <div className="mb-1 text-sm font-medium text-slate-400">{name}</div>
      <div className="text-2xl font-bold text-white">
        $
        {account.currentBalance.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
          {isPositive ? "+" : ""}$
          {change.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-slate-500">
          ({isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%) vs saldo inicial
        </span>
      </div>
      {account.lastCalculatedAt && (
        <div className="mt-3 text-xs text-slate-500">
          Ultimo calculo:{" "}
          {new Date(account.lastCalculatedAt).toLocaleDateString("es-MX")}
        </div>
      )}
    </div>
  );
}

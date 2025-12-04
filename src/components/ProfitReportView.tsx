import ProfitBatchTable from "./ProfitBatchTable";

interface ProfitReport {
  start: string;
  end: string;
  totalSales: string;
  totalExpenses: string;
  totalChickenCostsProRated: string;
  profit: string;
  batchDetails: any[];
}

export default function ProfitReportView({ report }: { report: ProfitReport }) {
  if (!report) return null;

  return (
    <div className="mt-6 rounded-xl bg-gray-900 p-6 text-white shadow">
      <h2 className="mb-4 text-2xl font-bold">Resultados del Reporte</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Ventas Totales</p>
          <p className="text-2xl font-bold">
            ${Number(report.totalSales).toLocaleString("ex-MX")}
          </p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Gastos Totales</p>
          <p className="text-2xl font-bold text-red-300">
            ${Number(report.totalExpenses).toLocaleString("es-MX")}
          </p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Costo Pollo (Proporcional)</p>
          <p className="text-2xl font-bold text-red-400">
            $
            {Number(report.totalChickenCostsProRated).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Ganancia</p>
          <p
            className={`text-2xl font-bold ${
              Number(report.profit) >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            $
            {Number(report.profit).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <ProfitBatchTable batches={report.batchDetails} />
    </div>
  );
}

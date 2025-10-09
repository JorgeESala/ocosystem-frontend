import { DailyReport } from "../services/api";

interface Props {
  report: DailyReport;
}

export default function DailyTable({ report }: Props) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-black">
        <thead className="bg-black-100 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-right">Ventas</th>
            <th className="px-4 py-2 text-right">Comprado</th>
            <th className="px-4 py-2 text-right">Tripa</th>
            <th className="px-4 py-2 text-right">Merma</th>
            <th className="px-4 py-2 text-right">Matados</th>
            <th className="px-4 py-2 text-right">Casilleros</th>
            <th className="px-4 py-2 text-right">Venta de Huevo</th>
            <th className="px-4 py-2 text-right">Gastos</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 text-white">
          <tr className="hover:bg-black-50 border-t">
            <td className="px-4 py-2 font-semibold">
              {new Date(report.date).toLocaleDateString("es-MX", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </td>
            <td className="px-4 py-2 text-right">
              $
              {report.totalSales.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="px-4 py-2 text-right">
              {report.totalBought?.toLocaleString("es-MX") ?? "-"}
            </td>
            <td className="px-4 py-2 text-right">{report.gut ?? "-"}</td>
            <td className="px-4 py-2 text-right">{report.waste ?? "-"}</td>
            <td className="px-4 py-2 text-right">
              {report.slaughteredChicken ?? "-"}
            </td>
            <td className="px-4 py-2 text-right">
              {report.eggCartonsQuantity ?? "-"}
            </td>
            <td className="px-4 py-2 text-right">${report.eggsSales ?? "-"}</td>
            <td className="px-4 py-2 text-right">
              $
              {report.totalExpenses.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

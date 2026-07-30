import { useParams } from "react-router-dom";
import ChecklistDashboardWidget from "@/features/branches/checklist/components/ChecklistDashboardWidget";
import PendingTasksWidget from "@/features/branches/checklist/components/PendingTasksWidget";
import GeneralCashSummaryWidget from "@/features/general-cash/components/GeneralCashSummaryWidget";
import OrderPredictionWidget from "@/features/order-prediction/components/OrderPredictionWidget";
import SalesAccuracyWidget from "@/features/sales-accuracy/components/SalesAccuracyWidget";

export default function BusinessDashboard() {
  const { slug } = useParams();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">
          {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : ""}
        </h1>
        <p className="text-sm text-slate-400">
          Vista general de la operación
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PendingTasksWidget />
        </div>
        <div className="lg:col-span-2">
          <GeneralCashSummaryWidget />
        </div>
      </div>

      {slug === "sucursales" && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OrderPredictionWidget />
            <SalesAccuracyWidget />
          </div>
          <ChecklistDashboardWidget />
        </>
      )}
    </div>
  );
}

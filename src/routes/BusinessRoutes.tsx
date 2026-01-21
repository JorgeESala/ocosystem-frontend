import BusinessDashboard from "@/components/BussinesDashboard";
import ComparisonsGraphs from "@/components/ComparisonGraphs";
import Expenses from "@/components/Expenses";
import Reports from "@/components/Reports";
import SalesAndBatches from "@/components/SalesAndBatches";
import ExpensesPage from "@/features/live-chicken/pages/ExpensesPage";
import FlockTrackingPage from "@/features/live-chicken/pages/FlockTrackingPage";
import ReportPage from "@/features/live-chicken/Reports/ReportPage";
import ProfitReportPage from "@/pages/ProfitReportPage";
import { Routes, Route } from "react-router-dom";

export default function BusinessRoutes() {
  return (
    <Routes>
      <Route index element={<BusinessDashboard />} />

      <Route path="reports" element={<Reports />} />
      <Route path="graphs" element={<ComparisonsGraphs />} />
      <Route path="salesAndBatches" element={<SalesAndBatches />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="profit" element={<ProfitReportPage />} />

      {/* 🐔 overrides */}
      <Route
        path="pollo-vivo/salesAndBatches"
        element={<FlockTrackingPage />}
      />

      <Route path="pollo-vivo/reports" element={<ReportPage />} />

      <Route path="pollo-vivo/expenses" element={<ExpensesPage />} />
    </Routes>
  );
}

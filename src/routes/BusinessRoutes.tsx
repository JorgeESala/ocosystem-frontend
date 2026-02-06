import BusinessDashboard from "@/components/BussinesDashboard";
import ComparisonsGraphs from "@/components/ComparisonGraphs";
import Expenses from "@/components/Expenses";
import Reports from "@/components/Reports";
import SalesAndBatches from "@/components/SalesAndBatches";
import { AccountsPage } from "@/features/live-chicken/accounting/pages/AccountsPage";
import ExpensesPage from "@/features/live-chicken/pages/ExpensesPage";
import FlockTrackingPage from "@/features/live-chicken/pages/FlockTrackingPage";
import ReportPage from "@/features/live-chicken/Reports/ReportPage";
import ProfitReportPage from "@/pages/ProfitReportPage";
import { Routes, Route, useParams } from "react-router-dom";

export default function BusinessRoutes() {
  const { slug } = useParams();

  const isLiveChicken = slug === "pollo-vivo";

  return (
    <Routes>
      {/* DASHBOARD */}
      <Route index element={<BusinessDashboard />} />

      {/* ===================== */}
      {/* 🐔 LIVE CHICKEN OVERRIDES */}
      {/* ===================== */}

      {isLiveChicken && (
        <>
          <Route path="salesAndBatches" element={<FlockTrackingPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="accounting" element={<AccountsPage />} />
        </>
      )}

      {/* ===================== */}
      {/* 🌍 GENERALES */}
      {/* ===================== */}

      {!isLiveChicken && (
        <>
          <Route path="salesAndBatches" element={<SalesAndBatches />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
        </>
      )}

      <Route path="graphs" element={<ComparisonsGraphs />} />
      <Route path="profit" element={<ProfitReportPage />} />
    </Routes>
  );
}

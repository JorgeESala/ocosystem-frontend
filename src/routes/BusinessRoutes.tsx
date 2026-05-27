import BusinessDashboard from "@/components/BussinesDashboard";
import ComparisonsGraphs from "@/components/ComparisonGraphs";
import SalesAndBatches from "@/components/SalesAndBatches";
import BranchReportsPage from "@/features/branches/reports/pages/BranchReportsPage";
import { UploadSalesReportPage } from "@/features/branches/report-reader/pages/UploadSalesReportPage";
import { AccountsPage } from "@/features/live-chicken/accounting/pages/AccountsPage";
import ExpensesPage from "@/features/live-chicken/pages/ExpensesPage";
import ReportPage from "@/features/live-chicken/Reports/ReportPage";
import { Routes, Route, useParams } from "react-router-dom";
import { BranchAccountsPage } from "@/features/branches/accounting/pages/BranchAccountsPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { EggAccountsPage } from "@/features/egg/accounting/pages/EggAccountsPage";
import { BatchPage } from "@/features/batch/pages/BatchPage";
import BranchExpensesPage from "@/features/branches/expenses/pages/BranchExpensesPage";
import BranchProfitReportPage from "@/features/branches/profit/pages/BranchProfitReportPage";
export default function BusinessRoutes() {
  const { slug } = useParams();

  // 1. Centralizamos la lógica de qué rutas mostrar
  // En lugar de múltiples bloques, usamos un switch o un objeto de configuración

  if (slug === "pollo-vivo") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route
          path="salesAndBatches"
          element={<BatchPage unitType={"LIVE_CHICKEN"} />}
        />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="accounting" element={<AccountsPage />} />
        {/* Rutas compartidas que también quieres en Pollo Vivo */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route path="profit" element={<BranchProfitReportPage />} />
      </Routes>
    );
  }

  if (slug === "sucursales") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="upload-reports" element={<UploadSalesReportPage />} />
        <Route path="reports" element={<BranchReportsPage />} />
        <Route path="accounting" element={<BranchAccountsPage />} />
        <Route path="salesAndBatches" element={<SalesAndBatches />} />
        <Route path="expenses" element={<BranchExpensesPage />} />

        {/* Rutas compartidas */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route path="profit" element={<BranchProfitReportPage />} />
      </Routes>
    );
  }
  if (slug === "huevo") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="upload-reports" element={<UploadSalesReportPage />} />
        <Route path="reports" element={<BranchReportsPage />} />
        <Route path="accounting" element={<EggAccountsPage />} />
        <Route
          path="salesAndBatches"
          element={<BatchPage unitType={"EGG"} />}
        />
        <Route path="expenses" element={<BranchExpensesPage />} />

        {/* Rutas compartidas */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route path="profit" element={<BranchProfitReportPage />} />
      </Routes>
    );
  }

  // Fallback para otros negocios genéricos
  return (
    <Routes>
      <Route index element={<BusinessDashboard />} />
      <Route path="salesAndBatches" element={<SalesAndBatches />} />
      <Route path="expenses" element={<BranchExpensesPage />} />
      <Route path="*" element={<ForbiddenPage />} />
    </Routes>
  );
}

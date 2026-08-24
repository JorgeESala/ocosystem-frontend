import BusinessDashboard from "@/components/BussinesDashboard";
import ComparisonsGraphs from "@/components/ComparisonGraphs";
import SalesAndBatches from "@/components/SalesAndBatches";
import BranchReportsPage from "@/features/branches/reports/pages/BranchReportsPage";
import { UploadSalesReportPage } from "@/features/branches/report-reader/pages/UploadSalesReportPage";
import { AccountsPage } from "@/features/live-chicken/accounting/pages/AccountsPage";
import ReportPage from "@/features/live-chicken/Reports/ReportPage";
import { Routes, Route, useParams } from "react-router-dom";
import { BranchAccountsPage } from "@/features/branches/accounting/pages/BranchAccountsPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { EggAccountsPage } from "@/features/egg/accounting/pages/EggAccountsPage";
import ExpensesPage from "@/features/expenses/pages/ExpensesPage";
import { BatchPage } from "@/features/batch/pages/BatchPage";
import BranchExpensesPage from "@/features/branches/expenses/pages/BranchExpensesPage";
import BranchProfitReportPage from "@/features/branches/profit/pages/BranchProfitReportPage";
import GeneralCashPage from "@/features/general-cash/pages/GeneralCashPage";
import GeneralCashHelpPage from "@/features/general-cash/pages/GeneralCashHelpPage";
import DeliverySchedulePage from "@/features/order-prediction/pages/DeliverySchedulePage";
import ChecklistPage from "@/features/branches/checklist/pages/ChecklistPage";
import ExpectedEventCalendarPage from "@/features/branches/checklist/pages/ExpectedEventCalendarPage";
import AdminConfigPage from "@/features/branches/checklist/pages/AdminConfigPage";
import HelpPage from "@/features/branches/checklist/pages/HelpPage";
import MyTasksPage from "@/features/branches/checklist/pages/MyTasksPage";
import { ProfitReportPage } from "@/features/batch/profit/pages/ProfitReportPage";
import { ClientsRoutesPage } from "@/features/clients-routes/pages/ClientsRoutesPage";
import RouteGuard from "./RouteGuard";
import ProductApprovalsPage from "@/features/branches/product-approvals/pages/ProductApprovalsPage";
export default function BusinessRoutes() {
  const { slug } = useParams();

  // 1. Centralizamos la lógica de qué rutas mostrar
  // En lugar de múltiples bloques, usamos un switch o un objeto de configuración

  if (slug === "pollo-vivo") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="mis-tareas" element={<MyTasksPage />} />
        <Route
          path="salesAndBatches"
          element={<BatchPage unitType={"LIVE_CHICKEN"} />}
        />
        <Route
          path="expenses"
          element={<ExpensesPage unitType="LIVE_CHICKEN" />}
        />
        <Route path="reports" element={<ReportPage />} />
        <Route
          path="clients-routes"
          element={<ClientsRoutesPage unitType="LIVE_CHICKEN" />}
        />
        <Route path="accounting" element={<AccountsPage />} />
        {/* Rutas compartidas que también quieres en Pollo Vivo */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route
          path="profit"
          element={<ProfitReportPage unitType="LIVE_CHICKEN" />}
        />
      </Routes>
    );
  }

  if (slug === "sucursales") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="mis-tareas" element={<MyTasksPage />} />
        <Route path="upload-reports" element={<UploadSalesReportPage />} />
        <Route path="reports" element={<BranchReportsPage />} />
        <Route path="accounting" element={<BranchAccountsPage />} />
        <Route path="salesAndBatches" element={<SalesAndBatches />} />
        <Route path="expenses" element={<BranchExpensesPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route
          path="checklist/admin"
          element={
            <RouteGuard>
              <AdminConfigPage />
            </RouteGuard>
          }
        />
        <Route
          path="checklist/calendar"
          element={<ExpectedEventCalendarPage />}
        />
        <Route path="checklist/help" element={<HelpPage />} />

        <Route path="general-cash" element={<GeneralCashPage />} />
        <Route path="general-cash/help" element={<GeneralCashHelpPage />} />
        <Route path="delivery-schedule" element={<DeliverySchedulePage />} />

        {/* Rutas compartidas */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route path="profit" element={<BranchProfitReportPage />} />
        <Route
          path="aprobaciones"
          element={
            <RouteGuard>
              <ProductApprovalsPage />
            </RouteGuard>
          }
        />
      </Routes>
    );
  }
  if (slug === "huevo") {
    return (
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="mis-tareas" element={<MyTasksPage />} />
        <Route path="upload-reports" element={<UploadSalesReportPage />} />
        <Route path="reports" element={<BranchReportsPage />} />
        <Route path="accounting" element={<EggAccountsPage />} />
        <Route
          path="salesAndBatches"
          element={<BatchPage unitType={"EGG"} />}
        />
        <Route path="expenses" element={<ExpensesPage unitType="EGG" />} />
        <Route
          path="clients-routes"
          element={<ClientsRoutesPage unitType="EGG" />}
        />

        {/* Rutas compartidas */}
        <Route path="graphs" element={<ComparisonsGraphs />} />
        <Route path="profit" element={<ProfitReportPage unitType="EGG" />} />
      </Routes>
    );
  }

  // Fallback para otros negocios genéricos
  return (
    <Routes>
      <Route index element={<BusinessDashboard />} />
      <Route path="mis-tareas" element={<MyTasksPage />} />
      <Route path="salesAndBatches" element={<SalesAndBatches />} />
      <Route path="expenses" element={<BranchExpensesPage />} />
      <Route path="*" element={<ForbiddenPage />} />
    </Routes>
  );
}

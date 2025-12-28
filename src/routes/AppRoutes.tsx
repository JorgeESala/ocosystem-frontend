import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoutes";
import AppLayout from "../layouts/AppLayout";

// Pages
import Home from "../pages/Home";
import AuthPage from "../pages/AuthPage";
import ChangeCredentialsPage from "../pages/ChangeCredentialsPage";
import ProfitReportPage from "../pages/ProfitReportPage";

// Components / Sections
import Reports from "../components/Reports";
import ComparisonGraphs from "../components/ComparisonGraphs";
import SalesAndBatches from "../components/SalesAndBatches";
import Expenses from "../components/Expenses";
import BusinessDashboard from "../components/BussinesDashboard";
import FlockTrackingPage from "../features/live-chicken/pages/FlockTrackingPage";
import ExpensesPage from "../features/live-chicken/pages/ExpensesPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/me/change-credentials"
            element={<ChangeCredentialsPage />}
          />

          {/* Global sections */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/comparisonGraphs" element={<ComparisonGraphs />} />
          <Route path="/salesAndBatches" element={<SalesAndBatches />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/profit" element={<ProfitReportPage />} />

          {/* Business */}
          <Route path="/business/:slug" element={<BusinessDashboard />} />
          <Route path="/business/:slug/reports" element={<Reports />} />
          <Route path="/business/:slug/graphs" element={<ComparisonGraphs />} />
          <Route
            path="/business/:slug/salesAndBatches"
            element={<SalesAndBatches />}
          />
          <Route
            path="/business/pollo-vivo/salesAndBatches"
            element={<FlockTrackingPage />}
          />
          <Route
            path="/business/pollo-vivo/expenses"
            element={<ExpensesPage />}
          />
          <Route path="/business/:slug/expenses" element={<Expenses />} />
          <Route path="/business/:slug/profit" element={<ProfitReportPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

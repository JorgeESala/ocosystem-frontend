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
import ProtectedBusinessRoute from "./ProtectedBusinessRoute";
import ForbiddenPage from "@/pages/ForbiddenPage";
import BusinessRoutes from "./BusinessRoutes";
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌐 PUBLIC */}
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* 🔐 AUTH */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* 🏠 GENERAL */}
          <Route path="/" element={<Home />} />
          <Route
            path="/me/change-credentials"
            element={<ChangeCredentialsPage />}
          />

          {/* ❌ forbidden */}
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* ⚠️ PROVISIONAL (luego se elimina) */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/comparisonGraphs" element={<ComparisonGraphs />} />
          <Route path="/salesAndBatches" element={<SalesAndBatches />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/profit" element={<ProfitReportPage />} />

          {/* 🏢 BUSINESS */}
          <Route
            path="/business/:slug/*"
            element={
              <ProtectedBusinessRoute>
                <BusinessRoutes />
              </ProtectedBusinessRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

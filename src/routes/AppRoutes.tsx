import { Routes, Route, useParams } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoutes";
import AppLayout from "../layouts/AppLayout";

// Pages
import Home from "../pages/Home";
import AuthPage from "../pages/AuthPage";
import ChangeCredentialsPage from "../pages/ChangeCredentialsPage";

// Components / Sections
import ComparisonGraphs from "../components/ComparisonGraphs";
import SalesAndBatches from "../components/SalesAndBatches";
import ProtectedBusinessRoute from "./ProtectedBusinessRoute";
import ForbiddenPage from "@/pages/ForbiddenPage";
import BusinessRoutes from "./BusinessRoutes";
import BranchReportsPage from "@/features/branches/reports/pages/BranchReportsPage";
import BranchExpensesPage from "@/features/branches/expenses/pages/BranchExpensesPage";
import BranchProfitReportPage from "@/features/branches/profit/pages/BranchProfitReportPage";
function BusinessRoutesWrapper() {
  const { slug } = useParams();
  // Al cambiar la key, React destruye el componente viejo y monta uno nuevo
  return <BusinessRoutes key={slug} />;
}
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
          <Route path="/reports" element={<BranchReportsPage />} />
          <Route path="/comparisonGraphs" element={<ComparisonGraphs />} />
          <Route path="/salesAndBatches" element={<SalesAndBatches />} />
          <Route path="/expenses" element={<BranchExpensesPage />} />
          <Route path="/profit" element={<BranchProfitReportPage />} />

          {/* 🏢 BUSINESS */}
          <Route
            path="/business/:slug/*"
            element={
              <ProtectedBusinessRoute>
                {/* Usamos el hook 'useLocation' o pasamos el slug como key 
          para forzar el re-render total al cambiar de negocio 
      */}
                <BusinessRoutesWrapper />
              </ProtectedBusinessRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

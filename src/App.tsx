import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./components/Home";
import Reports from "./components/Reports";
import ComparisonGraphs from "./components/ComparisonGraphs";
import SalesAndBatches from "./components/SalesAndBatches";
import Navbar from "./components/Navbar";
import BusinessDashboard from "./components/BussinesDashboard";
import Expenses from "./components/Expenses";
import ProfitReportPage from "./pages/ProfitReportPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Crear el cliente de React Query (puede ir fuera del componente)
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          <Navbar />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparisonGraphs"
                element={
                  <ProtectedRoute>
                    <ComparisonGraphs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salesAndBatches"
                element={
                  <ProtectedRoute>
                    <SalesAndBatches />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Home />} />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profit"
                element={
                  <ProtectedRoute>
                    <ProfitReportPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />

              {/* Dashboard de cada unidad */}
              <Route
                path="/business/:slug"
                element={
                  <ProtectedRoute>
                    <BusinessDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Sub-secciones */}
              <Route
                path="/business/:slug/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/:slug/graphs"
                element={
                  <ProtectedRoute>
                    <ComparisonGraphs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/:slug/salesAndBatches"
                element={
                  <ProtectedRoute>
                    <SalesAndBatches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/:slug/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/:slug/profit"
                element={
                  <ProtectedRoute>
                    <ProfitReportPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

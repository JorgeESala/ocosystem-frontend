import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Reports from "./components/Reports";
import ComparisonGraphs from "./components/ComparisonGraphs";
import SalesAndBatches from "./components/SalesAndBatches";
import Navbar from "./components/Navbar";
import BusinessDashboard from "./components/BussinesDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/comparisonGraphs" element={<ComparisonGraphs />} />
            <Route path="/salesAndBatches" element={<SalesAndBatches />} />
            <Route path="/" element={<Home />} />

            {/* Dashboard de cada unidad */}
            <Route path="/business/:slug" element={<BusinessDashboard />} />

            {/* Sub-secciones */}
            <Route path="/business/:slug/reports" element={<Reports />} />
            <Route
              path="/business/:slug/graphs"
              element={<ComparisonGraphs />}
            />
            <Route path="/business/:slug/sales" element={<SalesAndBatches />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

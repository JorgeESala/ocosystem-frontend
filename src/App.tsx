import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Reports from "./components/Reports";
import ComparisonGraphs from "./components/ComparisonGraphs";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-600">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/comparisonGraphs" element={<ComparisonGraphs />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

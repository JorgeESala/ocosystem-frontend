import { Button } from "flowbite-react";
import { useSearchParams } from "react-router-dom";
import ComparisonsGraphs from "@/components/ComparisonGraphs";
import { UploadSalesReportPage } from "@/features/branches/report-reader/pages/UploadSalesReportPage";
import BranchReportsPage from "./BranchReportsPage";

type HubTab = "resumen" | "comparativas" | "importar";

const TABS: { id: HubTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "comparativas", label: "Comparativas" },
  { id: "importar", label: "Importar" },
];

const parseTab = (value: string | null): HubTab =>
  value === "comparativas" || value === "importar" ? value : "resumen";

export default function BranchReportsHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const selectTab = (next: HubTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === "resumen") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            color={tab === item.id ? "blue" : "gray"}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "resumen" && <BranchReportsPage />}
      {tab === "comparativas" && <ComparisonsGraphs />}
      {tab === "importar" && <UploadSalesReportPage />}
    </div>
  );
}

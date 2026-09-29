import { useEffect, useState } from "react";
import { useReportBranches } from "@/features/branches/branch/reportBranches.queries";
import { ConsolidatedSalesDashboard } from "../components/ConsolidatedSalesDashboard";
import { SalesDashboard } from "../components/SalesDashboard";

interface DrilldownBranch {
  id: number;
  name: string;
}

export default function BranchReportsPage() {
  const [dates, setDates] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  });
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [drilldown, setDrilldown] = useState<DrilldownBranch | null>(null);
  const { excluded } = useReportBranches();

  useEffect(() => {
    if (!drilldown) return;
    if (excluded.some((item) => item.branchId === drilldown.id)) {
      setDrilldown(null);
    }
  }, [excluded, drilldown]);

  const handleDatesChange = (start: Date, end: Date) => {
    setDates({ start, end });
  };

  if (drilldown) {
    return (
      <SalesDashboard
        branchId={drilldown.id}
        branchName={drilldown.name}
        dates={dates}
        onDatesChange={handleDatesChange}
        onBack={() => setDrilldown(null)}
      />
    );
  }

  return (
    <ConsolidatedSalesDashboard
      dates={dates}
      onDatesChange={handleDatesChange}
      selectedBranchIds={selectedBranchIds}
      onSelectedBranchIdsChange={setSelectedBranchIds}
      onSelectBranch={(branchId, branchName) =>
        setDrilldown({ id: branchId, name: branchName })
      }
    />
  );
}

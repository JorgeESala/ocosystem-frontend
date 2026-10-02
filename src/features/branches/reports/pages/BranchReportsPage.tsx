import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { parseScopeParams } from "@/utils/scopeParams";
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
  const [searchParams] = useSearchParams();
  const {
    excluded,
    branches,
    isLoading: branchesLoading,
  } = useReportBranches();
  const scopeInitialized = useRef(false);

  useEffect(() => {
    if (scopeInitialized.current || branchesLoading) return;
    scopeInitialized.current = true;
    if (searchParams.get("branch")) return;
    const scope = parseScopeParams(
      searchParams,
      branches.map((branch) => branch.id),
    );
    if (scope.branchIds.length > 0) {
      setSelectedBranchIds(scope.branchIds);
    }
    if (scope.start && scope.end) {
      setDates({ start: scope.start, end: scope.end });
    }
  }, [branchesLoading, branches, searchParams]);

  useEffect(() => {
    if (!drilldown) return;
    if (excluded.some((item) => item.branchId === drilldown.id)) {
      setDrilldown(null);
    }
  }, [excluded, drilldown]);

  useEffect(() => {
    if (drilldown) return;
    const branchParam = searchParams.get("branch");
    if (!branchParam) return;
    const branch = branches.find((item) => item.id === Number(branchParam));
    if (branch) {
      setDrilldown({ id: branch.id, name: branch.name });
    }
  }, [searchParams, branches, drilldown]);

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

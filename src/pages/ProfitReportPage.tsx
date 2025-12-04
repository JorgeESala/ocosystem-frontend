import { useState } from "react";
import ProfitReportForm from "../components/ProfitReportForm";
import ProfitReportView from "../components/ProfitReportView";
import { fetchProfitReport } from "../services/api";

export default function ProfitReportPage() {
  const [report, setReport] = useState<any | null>(null);

  const handleGenerate = async ({
    start,
    end,
    branchIds,
  }: {
    start: Date;
    end: Date;
    branchIds: number[];
  }) => {
    const report = await fetchProfitReport({
      branchIds: branchIds,
      startDate: start,
      endDate: end,
    });
    setReport(report);
  };

  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <ProfitReportForm onSubmit={handleGenerate} />
      <ProfitReportView report={report} />
    </div>
  );
}

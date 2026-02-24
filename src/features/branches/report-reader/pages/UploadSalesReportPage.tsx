// UploadSalesReportPage.tsx

import { useState } from "react";
import { UploadStep } from "../components/UploadStep";
import { PreviewStep } from "../components/PreviewStep";
import { useConfirmSalesImport } from "../api/report.queries";
import type { SalesImportPreviewDTO } from "../types";

type Step = "UPLOAD" | "PREVIEW";

export const UploadSalesReportPage = () => {
  const [step, setStep] = useState<Step>("UPLOAD");
  const [previewData, setPreviewData] = useState<SalesImportPreviewDTO | null>(
    null,
  );

  const confirmMutation = useConfirmSalesImport();

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      {step === "UPLOAD" && (
        <UploadStep
          onPreviewSuccess={(data) => {
            setPreviewData(data);
            setStep("PREVIEW");
          }}
        />
      )}

      {step === "PREVIEW" && previewData && (
        <PreviewStep
          data={previewData}
          onBack={() => setStep("UPLOAD")}
          onConfirm={(payload) =>
            confirmMutation.mutate(payload, {
              onSuccess: () => {
                setStep("UPLOAD");
                setPreviewData(null);
              },
            })
          }
        />
      )}
    </div>
  );
};

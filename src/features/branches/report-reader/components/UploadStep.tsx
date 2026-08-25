// UploadStep.tsx

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Button, Spinner, Toast, ToastToggle } from "flowbite-react";
import { useUploadSalesReports } from "../api/report.queries";
import { BranchSelector } from "./BranchSelector";
import { ExcelDropzone } from "./ExcelDropzone";
import type { SalesImportPreviewDTO, UploadFile, UploadStatus } from "../types";
import axios from "axios";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

interface Props {
  onPreviewSuccess: (data: SalesImportPreviewDTO) => void;
}

export const UploadStep = ({ onPreviewSuccess }: Props) => {
  const [searchParams] = useSearchParams();
  const [branchId, setBranchId] = useState<number | undefined>(
    searchParams.get("branch") ? Number(searchParams.get("branch")) : undefined,
  );
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [toastState, setToastState] = useState<ToastState>(null);

  const previewMutation = useUploadSalesReports();

  const readyFiles = files.filter((f) => f.status === "ready");

  const handleUpload = () => {
    if (!branchId) return;

    if (readyFiles.length === 0) {
      setToastState({
        type: "error",
        message: "No hay archivos válidos para procesar",
      });
      return;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "ready" ? { ...f, status: "uploading" } : f,
      ),
    );

    previewMutation.mutate(
      {
        branchId,
        files: readyFiles.map((f) => f.file),
      },
      {
        onSuccess: (data) => {
          onPreviewSuccess(data);
        },
        onError: (error) => {
          if (axios.isAxiosError(error) && error.response?.status === 409) {
            const duplicated = error.response.data.duplicatedFiles as string[];
            const reasons = (error.response.data.duplicateReasons ??
              {}) as Record<string, string>;

            setFiles((prev) =>
              prev.map((f) => {
                if (duplicated.includes(f.file.name)) {
                  return { ...f, status: "duplicated" };
                }

                if (f.status === "uploading") {
                  return { ...f, status: "ready" };
                }

                return f;
              }),
            );

            const dateDuplicates = duplicated.filter(
              (name) => reasons[name] === "date",
            );

            setToastState({
              type: "error",
              message:
                dateDuplicates.length > 0
                  ? `El reporte del día ya fue subido (${dateDuplicates.length} archivo(s))`
                  : `Se detectaron ${duplicated.length} archivo(s) duplicado(s)`,
            });

            return;
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.status === "uploading" ? { ...f, status: "ready" } : f,
            ),
          );

          setToastState({
            type: "error",
            message: "Ocurrió un error al generar el preview",
          });
        },
      },
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold">Subir reportes de ventas</h2>

      <div className="space-y-6">
        <BranchSelector value={branchId} onChange={setBranchId} />
        <ExcelDropzone
          multiple
          onFilesSelect={(newFiles) =>
            setFiles((prev) => {
              const existingNames = prev.map((f) => f.file.name);

              const mapped = newFiles
                .filter((file) => !existingNames.includes(file.name))
                .map((file) => ({
                  file,
                  status: "ready" as UploadStatus,
                }));

              return [...prev, ...mapped];
            })
          }
          className="p-10"
        />

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.file.name}
                className={`flex items-center justify-between rounded border p-3 ${
                  item.status === "duplicated"
                    ? "border-red-300 bg-red-700"
                    : "border-gray-300 bg-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.file.name}</span>

                  {item.status === "duplicated" && (
                    <span className="text-xs text-red-200">
                      Archivo duplicado
                    </span>
                  )}

                  {item.status === "uploading" && (
                    <span className="text-xs text-blue-600">Procesando...</span>
                  )}
                </div>

                <Button
                  size="xs"
                  color="red"
                  onClick={() => removeFile(index)}
                  disabled={item.status === "uploading"}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        )}

        {toastState && (
          <Toast>
            <div className="ml-3 text-sm font-normal">{toastState.message}</div>
            <ToastToggle onClick={() => setToastState(null)} />
          </Toast>
        )}

        <Button
          onClick={handleUpload}
          disabled={
            !branchId || readyFiles.length === 0 || previewMutation.isPending
          }
        >
          {previewMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              Procesando...
            </div>
          ) : (
            "Generar preview"
          )}
        </Button>
      </div>
    </Card>
  );
};

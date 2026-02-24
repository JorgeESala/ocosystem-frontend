// src/components/reports/ExcelDropzone.tsx

import { useState, DragEvent } from "react";
import { Button } from "flowbite-react";

interface Props {
  onFilesSelect: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  text?: string;
}

export const ExcelDropzone = ({
  onFilesSelect,
  multiple = false,
  className = "",
  text = "Arrastra archivos Excel aquí",
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const filesArray = Array.from(fileList);
    onFilesSelect(filesArray);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${className}`}
    >
      <p className="text-gray-500">{text}</p>

      <label>
        <input
          type="file"
          accept=".xlsx,.xls"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button className="mt-3">Buscar archivos</Button>
      </label>
    </div>
  );
};

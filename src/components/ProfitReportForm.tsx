import { Button, Datepicker, Label } from "flowbite-react";
import { useState } from "react";
import { useBranches } from "../context/BranchContext";
import BranchMultiSelect from "./BranchMultiSelect";

interface ProfitReportFormProps {
  onSubmit: (params: {
    start: string;
    end: string;
    branchIds: number[];
  }) => void;
}

export default function ProfitReportForm({ onSubmit }: ProfitReportFormProps) {
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const branches = useBranches();
  const [branchIds, setBranchIds] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchIds || branchIds.length === 0) return;

    onSubmit({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      branchIds: branchIds,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-gray-800 p-4 shadow"
    >
      <h2 className="text-xl font-semibold text-white">Generar Reporte</h2>

      {/* Sucursal */}
      <div>
        <BranchMultiSelect
          branches={branches}
          selected={branchIds}
          onChange={setBranchIds}
        />
      </div>

      {/* Fecha inicio */}
      <div>
        <Label className="text-white">Fecha Inicio</Label>
        <Datepicker
          language="es-MX"
          value={start}
          onChange={(d) => d && setStart(d)}
        />
      </div>

      {/* Fecha fin */}
      <div>
        <Label className="text-white">Fecha Fin</Label>
        <Datepicker
          language="es-MX"
          value={end}
          onChange={(d) => d && setEnd(d)}
        />
      </div>

      <Button type="submit" className="w-full">
        Generar Reporte
      </Button>
    </form>
  );
}

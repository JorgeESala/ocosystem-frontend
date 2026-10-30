import { useEffect, useState } from "react";
import { Button, Label, Select } from "flowbite-react";
import { HiTruck, HiUserGroup } from "react-icons/hi";
import { useDrivers } from "@/features/employee/api/employees.queries";
import { ClientCollectionPanel } from "./ClientCollectionPanel";
import { TripCollectionsPanel } from "./TripCollectionsPanel";

type CollectionMode = "CLIENTE" | "DESPACHO";

interface Props {
  onSuccessToast?: (message: string) => void;
}

export const CobranzaWorkbench = ({ onSuccessToast }: Props) => {
  const [mode, setMode] = useState<CollectionMode>("CLIENTE");
  const { data: drivers = [] } = useDrivers();
  const [collectorId, setCollectorId] = useState(
    () => localStorage.getItem("cobranza.collectorId") ?? "",
  );
  const selectedCollector = drivers.find(
    (driver) => String(driver.id) === collectorId,
  );

  useEffect(() => {
    if (collectorId) {
      localStorage.setItem("cobranza.collectorId", collectorId);
    }
  }, [collectorId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div
          className="flex gap-2"
          role="tablist"
          aria-label="Modo de cobranza"
        >
          <Button
            color={mode === "CLIENTE" ? "blue" : "gray"}
            onClick={() => setMode("CLIENTE")}
            role="tab"
            aria-selected={mode === "CLIENTE"}
          >
            <HiUserGroup className="mr-2 h-4 w-4" />
            Cliente
          </Button>
          <Button
            color={mode === "DESPACHO" ? "blue" : "gray"}
            onClick={() => setMode("DESPACHO")}
            role="tab"
            aria-selected={mode === "DESPACHO"}
          >
            <HiTruck className="mr-2 h-4 w-4" />
            Despacho
          </Button>
        </div>
        <div className="w-56">
          <Label htmlFor="cobranza-collector">Cobrador</Label>
          <Select
            id="cobranza-collector"
            value={collectorId}
            onChange={(event) => setCollectorId(event.target.value)}
          >
            <option value="">Seleccionar cobrador</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {mode === "CLIENTE" ? (
        <ClientCollectionPanel onSuccessToast={onSuccessToast} />
      ) : (
        <TripCollectionsPanel
          collectorName={selectedCollector?.name ?? ""}
          onSuccessToast={onSuccessToast}
        />
      )}
    </div>
  );
};

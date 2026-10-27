import { useState } from "react";
import { Button } from "flowbite-react";
import { HiTruck, HiUserGroup } from "react-icons/hi";
import { ClientCollectionPanel } from "./ClientCollectionPanel";
import { TripCollectionsPanel } from "./TripCollectionsPanel";

type CollectionMode = "CLIENTE" | "DESPACHO";

interface Props {
  onSuccessToast?: (message: string) => void;
}

export const CobranzaWorkbench = ({ onSuccessToast }: Props) => {
  const [mode, setMode] = useState<CollectionMode>("CLIENTE");

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Modo de cobranza">
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

      {mode === "CLIENTE" ? (
        <ClientCollectionPanel onSuccessToast={onSuccessToast} />
      ) : (
        <TripCollectionsPanel onSuccessToast={onSuccessToast} />
      )}
    </div>
  );
};

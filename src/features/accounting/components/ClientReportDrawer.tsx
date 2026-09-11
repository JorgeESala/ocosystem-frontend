import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { useMemo } from "react";
import { useAccountingEntities } from "../api/accounting-entities.queries";
import type { ClientMonthlyReportPdfInput } from "../api/client-summary.api";
import { ClientMonthlyReport } from "./ClientMonthlyReport";

interface Props {
  open: boolean;
  onClose: () => void;
  debtorEntityId?: number;
  debtorName?: string;
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  onExportPdf?: (input: ClientMonthlyReportPdfInput) => void;
}

export const ClientReportDrawer = ({
  open,
  onClose,
  debtorEntityId,
  debtorName,
  from,
  to,
  onRangeChange,
  onExportPdf,
}: Props) => {
  const { data: entities = [] } = useAccountingEntities();
  const creditorNames = useMemo(
    () => new Map(entities.map((e) => [e.id, e.name] as const)),
    [entities],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="right"
      className="w-[560px]"
    >
      <DrawerHeader
        title={`Reporte del cliente · ${debtorName ?? "—"}`}
        titleIcon={() => <></>}
      />
      <DrawerItems>
        {debtorEntityId == null ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Selecciona un cliente para ver su reporte.
          </p>
        ) : (
          <ClientMonthlyReport
            debtorEntityId={debtorEntityId}
            debtorName={debtorName ?? ""}
            from={from}
            to={to}
            onRangeChange={onRangeChange}
            creditorNames={creditorNames}
            onExportPdf={onExportPdf}
          />
        )}
      </DrawerItems>
    </Drawer>
  );
};

export default ClientReportDrawer;

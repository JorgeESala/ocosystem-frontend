import { Drawer, Spinner, DrawerHeader, DrawerItems } from "flowbite-react";
import { useNotificationDetail } from "../api/notification.queries";
import {
  ALERT_TYPE_LABELS,
  DETAIL_ALERT_TYPES,
  type AlertType,
} from "../types";
import { WasteDetailContent } from "./WasteDetailContent";
import { ChecklistDetailContent } from "./ChecklistDetailContent";
import { DeliveryDetailContent } from "./DeliveryDetailContent";

interface Props {
  open: boolean;
  onClose: () => void;
  notificationId: number | null;
  alertType: AlertType | null;
}

const DETAIL_TITLES: Record<string, string> = {
  HIGH_WASTE: "Detalle de merma",
  OVERDUE_TASKS: "Estado del checklist diario",
  DELIVERY_NOT_RECEIVED: "Estado de entrega",
};

export function NotificationDetailDrawer({
  open,
  onClose,
  notificationId,
  alertType,
}: Props) {
  const { data, isLoading } = useNotificationDetail(
    open ? notificationId : null,
  );

  const showDetail =
    alertType != null && DETAIL_ALERT_TYPES.has(alertType) && !!data?.detail;

  const title =
    DETAIL_TITLES[alertType ?? ""] ??
    ALERT_TYPE_LABELS[alertType ?? "LOW_BALANCE"];

  return (
    <Drawer open={open} onClose={onClose} position="right" className="w-[550px]">
      <DrawerHeader title={title} />
      <DrawerItems>
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!isLoading && !showDetail && (
          <p className="text-sm text-gray-500">
            Sin datos detallados disponibles.
          </p>
        )}

        {!isLoading && showDetail && alertType && (
          <DetailContent alertType={alertType} detail={data!.detail as Record<string, unknown>} />
        )}
      </DrawerItems>
    </Drawer>
  );
}

function DetailContent({
  alertType,
  detail,
}: {
  alertType: AlertType;
  detail: Record<string, unknown>;
}) {
  switch (alertType) {
    case "HIGH_WASTE":
      return <WasteDetailContent detail={detail as unknown} />;
    case "OVERDUE_TASKS":
      return <ChecklistDetailContent detail={detail as unknown} />;
    case "DELIVERY_NOT_RECEIVED":
      return <DeliveryDetailContent detail={detail as unknown} />;
    default:
      return null;
  }
}

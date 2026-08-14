import { useEffect, useState } from "react";
import {
  Drawer,
  Spinner,
  DrawerHeader,
  DrawerItems,
  Button,
} from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  notificationApi,
  type NotificationPage,
} from "../api/notification.api";
import { notificationKeys } from "../api/notification.keys";
import {
  ALERT_TYPE_LABELS,
  ALERT_TYPE_ICONS,
  DETAIL_ALERT_TYPES,
  type AlertType,
  type NotificationDTO,
} from "../types";
import { NotificationDetailDrawer } from "./NotificationDetailDrawer";

const NAVIGATION_MAP: Partial<Record<AlertType, string>> = {
  LOW_BALANCE: "/business/sucursales/general-cash",
  NEGATIVE_BALANCE: "/business/sucursales/general-cash",
  NEGATIVE_FLOW: "/business/sucursales/general-cash",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  branchIds: number[];
}

export function NotificationHistoryDrawer({
  open,
  onClose,
  onNavigate,
  branchIds,
}: Props) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailType, setDetailType] = useState<AlertType | null>(null);
  const qc = useQueryClient();

  const fetchPage = async (pageNum: number) => {
    setLoading(true);
    try {
      const result = await notificationApi.getHistory(branchIds, pageNum, 20);
      setData((prev) => {
        if (pageNum === 0) return result;
        return {
          content: [...(prev?.content ?? []), ...result.content],
          page: result.page,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && branchIds.length > 0) {
      setPage(0);
      setData(null);
      fetchPage(0);
    }
  }, [open]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  const handleClose = () => {
    qc.invalidateQueries({ queryKey: notificationKeys.all });
    onClose();
  };

  const handleRowClick = (n: NotificationDTO) => {
    if (DETAIL_ALERT_TYPES.has(n.alertType)) {
      setDetailId(n.id);
      setDetailType(n.alertType);
    } else {
      const path = NAVIGATION_MAP[n.alertType];
      if (path) {
        onClose();
        onNavigate(path);
      }
    }
  };

  const handleDetailClose = () => {
    setDetailId(null);
    setDetailType(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={handleClose}
        position="right"
        className="w-[600px]"
      >
        <DrawerHeader title="Historial de notificaciones (7 días)" />
        <DrawerItems>
          {data === null && loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {data !== null && data.content.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              Sin notificaciones en los últimos 7 días.
            </p>
          )}

          {data !== null && data.content.length > 0 && (
            <>
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs text-gray-500">
                  <tr>
                    <th className="pr-2 pb-2">Fecha</th>
                    <th className="pr-2 pb-2">Tipo</th>
                    <th className="pr-2 pb-2">Sev.</th>
                    <th className="pr-2 pb-2">Sucursal</th>
                    <th className="pb-2">Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((n) => (
                    <tr
                      key={n.id}
                      className="cursor-pointer border-b last:border-0 hover:bg-gray-700/50"
                      onClick={() => handleRowClick(n)}
                    >
                      <td className="py-2 pr-2 text-xs whitespace-nowrap">
                        {formatDate(n.createdAt)}
                      </td>
                      <td className="py-2 pr-2">
                        <span className="mr-1 text-xs">
                          {ALERT_TYPE_ICONS[n.alertType as AlertType] ?? "🔔"}
                        </span>
                        <span className="text-xs">
                          {ALERT_TYPE_LABELS[n.alertType as AlertType] ??
                            n.alertType}
                        </span>
                      </td>
                      <td className="py-2 pr-2">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            n.severity === "critical"
                              ? "bg-red-900/40 text-red-300"
                              : "bg-amber-900/40 text-amber-300"
                          }`}
                        >
                          {n.severity === "critical" ? "Crítico" : "Aviso"}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-xs">{n.branchName}</td>
                      <td className="max-w-[200px] truncate py-2 text-xs text-gray-400">
                        {n.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.page.number < data.page.totalPages - 1 && (
                <div className="flex justify-center py-4">
                  <Button
                    size="sm"
                    color="gray"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : "Cargar más"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DrawerItems>
      </Drawer>

      <NotificationDetailDrawer
        open={detailId !== null}
        onClose={handleDetailClose}
        notificationId={detailId}
        alertType={detailType}
      />
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useBranches } from "@/features/branches/branch/branch.queries";
import {
  useNotificationSummary,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../api/notification.queries";
import { useNotificationStream } from "../api/useNotificationStream";
import {
  ALERT_TYPE_LABELS,
  ALERT_TYPE_ICONS,
  DETAIL_ALERT_TYPES,
  type AlertType,
  type NotificationDTO,
} from "../types";
import { NotificationDetailDrawer } from "./NotificationDetailDrawer";
import { NotificationHistoryDrawer } from "./NotificationHistoryDrawer";
import { formatRelativeDate } from "@/utils/notificationDates";

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-l-4 border-red-500 bg-red-900/20",
  warning: "border-l-4 border-amber-500 bg-amber-900/20",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailType, setDetailType] = useState<AlertType | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: branches } = useBranches();
  const branchIds = Array.isArray(branches) ? branches.map((b) => b.id) : [];

  useNotificationStream(branchIds);
  const { data: summary } = useNotificationSummary(branchIds);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right + 8,
      });
    }
    setOpen(!open);
  };

  const handleNotificationClick = (n: NotificationDTO) => {
    markRead.mutate(n.id);
    setOpen(false);
    if (DETAIL_ALERT_TYPES.has(n.alertType)) {
      setDetailId(n.id);
      setDetailType(n.alertType);
    } else if (
      n.alertType === "LOW_BALANCE" ||
      n.alertType === "NEGATIVE_BALANCE" ||
      n.alertType === "NEGATIVE_FLOW"
    ) {
      navigate("/business/sucursales/general-cash");
    }
  };

  const handleDetailClose = () => {
    setDetailId(null);
    setDetailType(null);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(branchIds);
  };

  const unreadCount = summary?.unreadCount ?? 0;
  const notifications = summary?.recent ?? [];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        onClick={handleToggle}
      >
        <HiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-80 rounded-lg border border-slate-700 bg-slate-800 shadow-xl"
            style={{ top: position.top, left: position.left }}
          >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
              <span className="text-sm font-semibold text-white">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={handleMarkAllRead}
                >
                  Marcar todo como leído
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  Sin notificaciones
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`cursor-pointer px-4 py-3 hover:bg-slate-700/50 ${SEVERITY_STYLE[n.severity] ?? ""}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-sm">
                        {ALERT_TYPE_ICONS[n.alertType] ?? "🔔"}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-300">
                          {n.branchName}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {n.message}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {formatRelativeDate(n.createdAt)}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">
                            {ALERT_TYPE_LABELS[n.alertType]}
                          </span>
                          <button
                            type="button"
                            className="text-[10px] text-slate-500 hover:text-blue-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead.mutate(n.id);
                            }}
                          >
                            Marcar como leído
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-700 px-4 py-2">
              <button
                type="button"
                className="text-xs text-blue-400 hover:text-blue-300"
                onClick={() => {
                  setOpen(false);
                  setHistoryOpen(true);
                }}
              >
                Historial
              </button>
            </div>
          </div>,
          document.body,
        )}

      <NotificationDetailDrawer
        open={detailId !== null}
        onClose={handleDetailClose}
        notificationId={detailId}
        alertType={detailType}
      />

      <NotificationHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onNavigate={(path) => navigate(path)}
        branchIds={branchIds}
      />
    </>
  );
}

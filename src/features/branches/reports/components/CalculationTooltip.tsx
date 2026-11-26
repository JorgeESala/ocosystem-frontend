import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ExpectedCalculationContent,
  type ExpectedCalculationProps,
} from "./ExpectedCalculationContent";

interface Props extends ExpectedCalculationProps {
  children: ReactNode;
  triggerLabel?: string;
  valueLabel?: string;
}

const VIEWPORT_MARGIN = 8;

export const CalculationTooltip = ({
  children,
  triggerLabel = "Ver cálculo de la venta esperada",
  valueLabel,
  ...contentProps
}: Props) => {
  const [open, setOpen] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setTouchOpen(false);
    setMeasured(false);
  }, []);

  const show = useCallback(() => setOpen(true), []);

  const positionTooltip = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const above = triggerRect.top - contentRect.height - VIEWPORT_MARGIN;
    const preferredTop =
      above >= VIEWPORT_MARGIN ? above : triggerRect.bottom + VIEWPORT_MARGIN;
    const maxTop = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - contentRect.height - VIEWPORT_MARGIN,
    );
    const centered =
      triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - contentRect.width - VIEWPORT_MARGIN,
    );
    const left = Math.min(Math.max(VIEWPORT_MARGIN, centered), maxLeft);

    setPosition({ top: Math.min(preferredTop, maxTop), left });
    setMeasured(true);
  }, []);

  useLayoutEffect(() => {
    if (open) positionTooltip();
  }, [open, positionTooltip]);

  useEffect(() => {
    const content = contentRef.current;
    if (!open || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => positionTooltip());
    observer.observe(content);
    return () => observer.disconnect();
  }, [open, positionTooltip]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    const handleScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && contentRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const handleResize = () => close();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDownOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, close]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (event.pointerType !== "touch") return;
    if (open) {
      close();
      return;
    }
    setTouchOpen(true);
    show();
  };

  const handleLeave = () => {
    if (!touchOpen) close();
  };

  const accessibleLabel = valueLabel
    ? `${valueLabel}. ${triggerLabel}`
    : triggerLabel;

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help border-b border-dotted border-gray-500/70"
        tabIndex={0}
        aria-label={accessibleLabel}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={handleLeave}
        onFocus={show}
        onBlur={handleLeave}
        onPointerDown={handlePointerDown}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") close();
        }}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            ref={contentRef}
            id={tooltipId}
            role="tooltip"
            className={`fixed z-[9999] max-h-[calc(100vh-1rem)] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-left shadow-xl ${
              touchOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              top: position.top,
              left: position.left,
              visibility: measured ? "visible" : "hidden",
            }}
          >
            <ExpectedCalculationContent {...contentProps} />
          </div>,
          document.body,
        )}
    </>
  );
};

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Right-side drawer (full-width sheet on mobile). Modal: background is inert. */
export function Drawer({ open, onClose, title, subtitle, children, footer, width = 440 }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const app = document.getElementById("app-shell");
    app?.setAttribute("inert", "");
    document.body.classList.add("has-drawer");
    const t = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 30);
    return () => {
      window.clearTimeout(t);
      app?.removeAttribute("inert");
      document.body.classList.remove("has-drawer");
      returnFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const els = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="drawer-root" onKeyDown={onKeyDown}>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        style={{ "--drawer-w": `${width}px` } as React.CSSProperties}
      >
        <header className="drawer__head">
          <div>
            <h2 id={`${id}-title`} className="drawer__title">
              {title}
            </h2>
            {subtitle && <div className="drawer__subtitle">{subtitle}</div>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Loka">
            <IconClose />
          </button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer && <footer className="drawer__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

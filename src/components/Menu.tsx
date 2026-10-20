import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "../lib/hooks";
import { IconMore } from "./Icons";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

interface Props {
  items: MenuItem[];
  label: string;
  trigger?: ReactNode;
  triggerClassName?: string;
  align?: "left" | "right";
  header?: ReactNode;
}

/** Accessible overflow menu (button + role="menu"). */
export function Menu({ items, label, trigger, triggerClassName = "icon-btn", align = "right", header }: Props) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, [btn, list]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const els = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
    const idx = els.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(idx + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(idx - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      els[els.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="menu">
      <button
        ref={btn}
        type="button"
        className={triggerClassName}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger ?? <IconMore />}
      </button>
      {open && (
        <div ref={list} id={id} role="menu" aria-label={label} className={`menu__list menu__list--${align}`} onKeyDown={onKeyDown}>
          {header && <div className="menu__header">{header}</div>}
          {items.map((it, i) => (
            <div key={i} role="none">
              {it.separatorBefore && <div className="menu__sep" role="separator" />}
              <button
                type="button"
                role="menuitem"
                className={`menu__item${it.danger ? " menu__item--danger" : ""}`}
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  it.onSelect();
                  btn.current?.focus();
                }}
              >
                {it.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

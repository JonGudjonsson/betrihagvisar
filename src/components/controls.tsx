import type { ReactNode } from "react";
import { IconCheck } from "./Icons";

/** Checkbox row with custom box; native input stays accessible. */
export function CheckRow({
  checked,
  onChange,
  label,
  meta,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  meta?: ReactNode;
  name?: string;
}) {
  return (
    <label className="check-row">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="check-row__box" aria-hidden="true">
        {checked && <IconCheck size={14} />}
      </span>
      <span className="check-row__label">{label}</span>
      {meta != null && <span className="check-row__meta">{meta}</span>}
    </label>
  );
}

export function RadioRow({
  checked,
  onChange,
  label,
  name,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  name: string;
  hint?: ReactNode;
}) {
  return (
    <label className="radio-row">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className="radio-row__dot" aria-hidden="true" />
      <span className="radio-row__label">
        {label}
        {hint && <span className="radio-row__hint">{hint}</span>}
      </span>
    </label>
  );
}

/** Segmented control: a group of pressed/unpressed buttons. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={`segmented__opt${value === o.value ? " is-on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FieldGroup({ title, children, open = true, collapsible = false }: { title: string; children: ReactNode; open?: boolean; collapsible?: boolean }) {
  if (!collapsible) {
    return (
      <fieldset className="field-group">
        <legend className="field-group__title">{title}</legend>
        {children}
      </fieldset>
    );
  }
  return (
    <details className="field-group field-group--details" open={open}>
      <summary className="field-group__title">{title}</summary>
      <fieldset className="field-group__inner">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}

import type { FigureDefinition, SeriesDefinition, Transform } from "../types";
import { seriesColor, visibleSeriesDefs } from "../lib/transforms";

interface Props {
  figure: FigureDefinition;
  transform: Transform;
  hidden?: string[];
  onToggle?: (seriesId: string) => void;
}

function Swatch({ figure, s }: { figure: FigureDefinition; s: SeriesDefinition }) {
  const color = seriesColor(figure, s);
  const kind = s.kind ?? figure.chartType;
  if (kind === "bar" || kind === "area") {
    return (
      <svg width="12" height="12" aria-hidden="true" className="legend__sw">
        <rect x="1" y="1" width="10" height="10" fill={color} />
      </svg>
    );
  }
  if (kind === "scatter" || s.markers) {
    return (
      <svg width="20" height="12" aria-hidden="true" className="legend__sw">
        {s.markers && <line x1="1" y1="6" x2="19" y2="6" stroke={color} strokeWidth={1.6} />}
        <circle cx="10" cy="6" r="3.5" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="20" height="10" aria-hidden="true" className="legend__sw">
      <line
        x1="1"
        y1="5"
        x2="19"
        y2="5"
        stroke={color}
        strokeWidth={s.reference ? 1.5 : 2.2}
        strokeDasharray={s.dashed ? "4 3" : undefined}
      />
    </svg>
  );
}

/** Legend below the plot. Interactive (toggles series) in spotlight mode. */
export function FigureLegend({ figure, transform, hidden = [], onToggle }: Props) {
  if (figure.chartType === "table") return null;
  const defs = visibleSeriesDefs(figure, transform).filter((s) => !s.hideInLegend);
  if (figure.xType === "category" && defs.length <= 1) return null;
  if (defs.length === 0) return null;
  // As in the report: name the axis when the figure has two.
  const dual = figure.series.some((s) => s.axis === "right") && figure.series.some((s) => s.axis !== "right");
  const label = (s: SeriesDefinition) => (dual && !/ás\)$/.test(s.name) ? `${s.name} (${s.axis === "right" ? "h" : "v"}. ás)` : s.name);

  return (
    <ul className={`legend${onToggle ? " legend--interactive" : ""}`} aria-label="Skýringar">
      {defs.map((s) => {
        const off = hidden.includes(s.id);
        return (
          <li key={s.id}>
            {onToggle ? (
              <button type="button" className={`legend__item${off ? " is-off" : ""}`} aria-pressed={!off} onClick={() => onToggle(s.id)}>
                <Swatch figure={figure} s={s} />
                <span>{label(s)}</span>
              </button>
            ) : (
              <span className="legend__item">
                <Swatch figure={figure} s={s} />
                <span>{label(s)}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

import { memo, useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FigureDefinition } from "../types";
import { defaultView } from "../lib/transforms";
import { transformUnit, FREQUENCY_NOTE } from "../lib/format";
import { copyText, downloadFigureCsv, figureUrl } from "../lib/figureActions";
import { useIsMobile } from "../lib/hooks";
import { CHAPTER_BY_ID } from "../data/chapters";
import { useBrowse, useToast } from "../state/AppState";
import { ChartFrame } from "./ChartFrame";
import { FigureLegend } from "./FigureLegend";
import { Menu, type MenuItem } from "./Menu";
import { AddToSetPopover } from "./AddToSetPopover";
import { IconExpand } from "./Icons";

export interface FigurePanelProps {
  figure: FigureDefinition;
  variant?: "public" | "set";
  /** Spans two columns (set "aðalmynd"). */
  wide?: boolean;
  arrange?: boolean;
  /** Drag handle rendered by the sortable wrapper. */
  handle?: ReactNode;
  /** Items appended to the default overflow menu. */
  extraMenuItems?: MenuItem[];
  /** Items used instead of defaults while arranging. */
  arrangeMenuItems?: MenuItem[];
  /** Show chapter name (cross-chapter results and sets). */
  showChapter?: boolean;
  eager?: boolean;
  overlay?: boolean;
}

function FigurePanelImpl({
  figure,
  variant = "public",
  wide = false,
  arrange = false,
  handle,
  extraMenuItems = [],
  arrangeMenuItems,
  showChapter = false,
  eager = false,
  overlay = false,
}: FigurePanelProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { updated } = useBrowse();
  const isMobile = useIsMobile();
  const view = useMemo(() => defaultView(figure), [figure]);
  const unit = transformUnit(view.transform, view.frequency, figure.unit, figure.transformLabels?.[view.transform]);
  const isUpdated = updated.has(figure.id);
  const chapter = CHAPTER_BY_ID[figure.chapterId];

  const base = wide ? (isMobile ? 240 : 320) : isMobile ? 220 : 205;
  // Horizontal category charts need room for every label.
  const height = figure.horizontal ? Math.max(base, (figure.categories?.length ?? 0) * 19 + 34) : base;

  const defaultItems: MenuItem[] = [
    { label: "Opna í kastljósi", onSelect: () => navigate(`/figure/${figure.id}`) },
    ...(figure.unavailable ? [] : [{ label: "Sækja gögn (CSV)", onSelect: () => void downloadFigureCsv(figure) }]),
    {
      label: "Afrita tengil",
      onSelect: async () => toast.show((await copyText(figureUrl(figure.id))) ? "Tengill afritaður." : "Ekki tókst að afrita tengil."),
    },
    ...(showChapter ? [{ label: `Sjá kafla ${figure.chapterId}`, onSelect: () => navigate(`/section/${figure.chapterId}`) }] : []),
    ...extraMenuItems,
  ];
  const items = arrange && arrangeMenuItems ? arrangeMenuItems : defaultItems;
  const sourceLine = `${figure.sources.length > 1 ? "Heimildir" : "Heimild"}: ${figure.sources.join(", ")}.`;

  return (
    <article
      className={`fig fig--${variant}${wide ? " fig--wide" : ""}${arrange ? " fig--arrange" : ""}${overlay ? " fig--overlay" : ""}`}
      aria-labelledby={`fig-title-${figure.id}${overlay ? "-o" : ""}`}
    >
      <header className="fig__head">
        {handle}
        <div className="fig__titles">
          <div className="fig__id">
            <span>{figure.id}</span>
            {showChapter && chapter && <span className="fig__chapter">{chapter.shortTitle}</span>}
            {isUpdated && (
              <span className="fig__updated">
                <span className="dot" aria-hidden="true" />
                Ný gögn
              </span>
            )}
          </div>
          <h3 className="fig__title" id={`fig-title-${figure.id}${overlay ? "-o" : ""}`}>
            {arrange || overlay ? figure.title : <Link to={`/figure/${figure.id}`}>{figure.title}</Link>}
          </h3>
          {figure.subtitle && <p className="fig__subtitle">{figure.subtitle}</p>}
        </div>
        {!overlay && (
          <div className="fig__actions">
            {!arrange && <AddToSetPopover figureId={figure.id} />}
            {!arrange && (
              <Link to={`/figure/${figure.id}`} className="icon-btn" aria-label={`Kastljós: ${figure.title}`} title="Kastljós">
                <IconExpand />
              </Link>
            )}
            <Menu items={items} label={arrange ? `Færa ${figure.id}` : `Fleiri aðgerðir fyrir ${figure.id}`} />
          </div>
        )}
      </header>

      <FigureUnits figure={figure} unit={unit} />
      <ChartFrame figure={figure} view={view} height={height} eager={eager || overlay} />
      <FigureLegend figure={figure} transform={view.transform} />

      <footer className="fig__meta">
        {variant === "public" ? (
          <>
            <p>{figure.note ?? `${FREQUENCY_NOTE[figure.frequency]}.`}</p>
            <p>{sourceLine}</p>
          </>
        ) : (
          <p>
            {FREQUENCY_NOTE[figure.frequency]} · {figure.sources.join(", ")}
          </p>
        )}
      </footer>
    </article>
  );
}

export const FigurePanel = memo(FigurePanelImpl);

/** Axis units above the plot: left unit on the left, right unit (or "Nýjast") on the right, as in the report. */
export function FigureUnits({ figure, unit }: { figure: FigureDefinition; unit: string }) {
  const right = figure.series.some((s) => s.axis === "right") ? figure.unitRight : undefined;
  return (
    <div className="fig__units">
      <span>{unit}</span>
      {(right || figure.latest) && <span className="fig__units-right">{right ?? figure.latest}</span>}
    </div>
  );
}

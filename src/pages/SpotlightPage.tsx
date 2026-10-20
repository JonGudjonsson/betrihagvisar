import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { ChartView, FigureDefinition, Frequency, PeriodPreset, Transform } from "../types";
import { getFigure, figuresInChapter } from "../data/figures";
import { CHAPTER_BY_ID } from "../data/chapters";
import { computeView, defaultView, figureCoverage, frequencyOptions, isTimeFigure, transformOptions, visibleSeriesDefs } from "../lib/transforms";
import { FREQUENCY_LABEL, FREQUENCY_NOTE, formatDate, formatNumber, formatPeriod, isoDate, transformOptionLabel, transformUnit } from "../lib/format";
import { copyText, downloadFigureCsv } from "../lib/figureActions";
import { useFigureData, useIsMobile } from "../lib/hooks";
import { useBrowse, useToast } from "../state/AppState";
import { ChartFrame } from "../components/ChartFrame";
import { FigureLegend } from "../components/FigureLegend";
import { FigureUnits } from "../components/FigurePanel";
import { AddToSetPopover } from "../components/AddToSetPopover";
import { CheckRow, Segmented } from "../components/controls";
import { IconArrowLeft, IconArrowRight, IconDownload, IconLink } from "../components/Icons";
import { NotFoundPage } from "./NotFoundPage";

const PERIODS: { value: PeriodPreset; label: string }[] = [
  { value: "1Y", label: "1Á" },
  { value: "5Y", label: "5Á" },
  { value: "10Y", label: "10Á" },
  { value: "all", label: "Allt" },
  { value: "custom", label: "Sérsniðið" },
];

function useViewParams(fig: FigureDefinition | undefined): [ChartView, (patch: Partial<ChartView>) => void, () => void, boolean] {
  const [params, setParams] = useSearchParams();
  const def = fig ? defaultView(fig) : null;
  const view: ChartView = useMemo(() => {
    if (!fig || !def) return { period: "all", transform: "level", frequency: "monthly", hidden: [] };
    const p = params.get("p") as PeriodPreset | null;
    const t = params.get("t") as Transform | null;
    const f = params.get("f") as Frequency | null;
    return {
      period: p && PERIODS.some((x) => x.value === p) ? p : def.period,
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      transform: t && transformOptions(fig).includes(t) ? t : def.transform,
      frequency: f && frequencyOptions(fig).includes(f) ? f : def.frequency,
      hidden: params.get("h")?.split(",").filter(Boolean) ?? [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fig, params]);

  const update = (patch: Partial<ChartView>) => {
    if (!fig || !def) return;
    const next = { ...view, ...patch };
    const sp = new URLSearchParams();
    if (next.period !== def.period) sp.set("p", next.period);
    if (next.period === "custom") {
      if (next.from) sp.set("from", next.from);
      if (next.to) sp.set("to", next.to);
    }
    if (next.transform !== def.transform) sp.set("t", next.transform);
    if (next.frequency !== def.frequency) sp.set("f", next.frequency);
    if (next.hidden.length) sp.set("h", next.hidden.join(","));
    setParams(sp, { replace: true });
  };
  const isDefault = params.toString() === "";
  return [view, update, () => setParams(new URLSearchParams(), { replace: true }), isDefault];
}

export function SpotlightPage() {
  const { figureId } = useParams();
  const fig = getFigure(figureId);
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useIsMobile();
  const { clearUpdated } = useBrowse();
  const [view, update, reset, isDefault] = useViewParams(fig);

  useEffect(() => {
    if (fig) clearUpdated(fig.id);
  }, [fig, clearUpdated]);

  const { figure: full } = useFigureData(fig, true);
  const cv = useMemo(() => (full ? computeView(full, view) : null), [full, view]);

  if (!fig) return <NotFoundPage />;

  const chapter = CHAPTER_BY_ID[fig.chapterId];
  const siblings = figuresInChapter(fig.chapterId);
  const idx = siblings.findIndex((f) => f.id === fig.id);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  const timeFig = isTimeFigure(fig);
  const transforms = transformOptions(fig);
  const freqs = frequencyOptions(fig);
  const seriesDefs = visibleSeriesDefs(fig, view.transform);
  const unit = transformUnit(view.transform, view.frequency, fig.unit, fig.transformLabels?.[view.transform]);
  const [cs, ce] = figureCoverage(fig);
  const hasControls = timeFig || seriesDefs.length > 1;

  const goBack = () => {
    const state = window.history.state as { idx?: number } | null;
    if (state?.idx && state.idx > 0) navigate(-1);
    else navigate(`/section/${fig.chapterId}`);
  };

  const toggleSeries = (id: string) => {
    const hidden = view.hidden.includes(id) ? view.hidden.filter((h) => h !== id) : [...view.hidden, id];
    const remaining = seriesDefs.filter((s) => !s.reference && !hidden.includes(s.id));
    if (remaining.length === 0) {
      toast.show("Að minnsta kosti ein röð þarf að vera sýnileg.");
      return;
    }
    update({ hidden });
  };

  return (
    <div className="page page--spotlight">
      <div className="spot-top">
        <button type="button" className="btn btn--text spot-back" onClick={goBack}>
          <IconArrowLeft size={16} /> Til baka
        </button>
        <Link to={`/section/${chapter.id}`} className="spot-crumb">
          <span className="roman">{chapter.id}</span> {chapter.title}
        </Link>
      </div>

      <header className="spot-head">
        <div className="spot-head__id">{fig.id}</div>
        <div>
          <h1 className="spot-head__title">{fig.title}</h1>
          {fig.subtitle && <p className="spot-head__subtitle">{fig.subtitle}</p>}
        </div>
      </header>

      <div className={`spot-body${hasControls ? "" : " spot-body--single"}`}>
        <div className="spot-main">
          <FigureUnits figure={fig} unit={unit} />
          <ChartFrame figure={fig} view={view} height={isMobile ? 300 : 470} detailed eager />
          <FigureLegend figure={fig} transform={view.transform} hidden={view.hidden} onToggle={seriesDefs.length > 1 ? toggleSeries : undefined} />

          <div className="spot-meta">
            {fig.note && <p>{fig.note}</p>}
            <dl className="spot-meta__list">
              <div>
                <dt>Tíðni</dt>
                <dd>{FREQUENCY_NOTE[fig.frequency]}</dd>
              </div>
              {timeFig && (
                <div>
                  <dt>Gögn ná yfir</dt>
                  <dd>
                    {formatPeriod(cs, fig.frequency)} – {formatPeriod(ce, fig.frequency)}
                  </dd>
                </div>
              )}
              {fig.latest && (
                <div>
                  <dt>Nýjustu gögn</dt>
                  <dd>{fig.latest.replace(/^Nýjast:\s*/i, "")}</dd>
                </div>
              )}
              <div>
                <dt>Síðast uppfært</dt>
                <dd>{formatDate(fig.updatedAt)}</dd>
              </div>
              <div>
                <dt>{fig.sources.length > 1 ? "Heimildir" : "Heimild"}</dt>
                <dd>{fig.sources.join(", ")}</dd>
              </div>
            </dl>
          </div>

          <div className="spot-actions">
            <button type="button" className="btn btn--secondary" onClick={() => void downloadFigureCsv(fig, view)} disabled={!!fig.unavailable}>
              <IconDownload size={16} /> Sækja gögn (CSV)
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={async () => toast.show((await copyText(window.location.href)) ? "Tengill afritaður. Hann geymir núverandi stillingar." : "Ekki tókst að afrita tengil.")}
            >
              <IconLink size={16} /> Afrita tengil
            </button>
            <AddToSetPopover figureId={fig.id} variant="button" />
          </div>

          {full && cv && <DataTable fig={full} cv={cv} />}
        </div>

        {hasControls && (
          <aside className="spot-controls" aria-label="Stillingar myndar">
            <h2 className="spot-controls__title">Stillingar</h2>
            {timeFig && (
              <section className="control-section">
                <h3>Tímabil</h3>
                <Segmented
                  label="Tímabil"
                  options={PERIODS}
                  value={view.period}
                  onChange={(p) =>
                    update(
                      p === "custom"
                        ? { period: p, from: view.from ?? isoDate(Math.max(cs, new Date(new Date(ce).getFullYear() - 3, 0, 1).getTime())), to: view.to ?? isoDate(ce) }
                        : { period: p },
                    )
                  }
                />
                {view.period === "custom" && (
                  <div className="date-range">
                    <label>
                      <span>Frá</span>
                      <input className="input input--sm" type="date" min={isoDate(cs)} max={isoDate(ce)} value={view.from ?? ""} onChange={(e) => update({ from: e.target.value })} />
                    </label>
                    <label>
                      <span>Til</span>
                      <input className="input input--sm" type="date" min={isoDate(cs)} max={isoDate(ce)} value={view.to ?? ""} onChange={(e) => update({ to: e.target.value })} />
                    </label>
                  </div>
                )}
              </section>
            )}

            {seriesDefs.length > 1 && (
              <section className="control-section">
                <h3>Raðir</h3>
                {seriesDefs
                  .filter((s) => !s.hideInLegend)
                  .map((s) => (
                  <CheckRow key={s.id} checked={!view.hidden.includes(s.id)} onChange={() => toggleSeries(s.id)} label={s.name} />
                ))}
              </section>
            )}

            {transforms.length > 1 && (
              <section className="control-section">
                <h3>
                  <label htmlFor="spot-transform">Umbreyting</label>
                </h3>
                <select id="spot-transform" className="select" value={view.transform} onChange={(e) => update({ transform: e.target.value as Transform })}>
                  {transforms.map((t) => (
                    <option key={t} value={t}>
                      {transformOptionLabel(t, view.frequency)}
                    </option>
                  ))}
                </select>
              </section>
            )}

            {freqs.length > 1 && (
              <section className="control-section">
                <h3>
                  <label htmlFor="spot-freq">Tíðni</label>
                </h3>
                <select id="spot-freq" className="select" value={view.frequency} onChange={(e) => update({ frequency: e.target.value as Frequency })}>
                  {freqs.map((f) => (
                    <option key={f} value={f}>
                      {FREQUENCY_LABEL[f]}
                      {f !== fig.frequency ? (fig.aggregate === "sum" ? " (samtala)" : " (meðaltal)") : ""}
                    </option>
                  ))}
                </select>
              </section>
            )}

            {!isDefault && (
              <button type="button" className="btn btn--text btn--sm" onClick={reset}>
                Endurstilla sjálfgefið
              </button>
            )}
          </aside>
        )}
      </div>

      <nav className="spot-pager" aria-label="Fletta milli mynda">
        {prev ? (
          <Link to={`/figure/${prev.id}`} className="spot-pager__link">
            <IconArrowLeft size={16} />
            <span>
              <span className="spot-pager__label">Fyrri mynd</span>
              <span className="spot-pager__title">
                {prev.id} {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/figure/${next.id}`} className="spot-pager__link spot-pager__link--next">
            <span>
              <span className="spot-pager__label">Næsta mynd</span>
              <span className="spot-pager__title">
                {next.id} {next.title}
              </span>
            </span>
            <IconArrowRight size={16} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function DataTable({ fig, cv }: { fig: FigureDefinition; cv: ReturnType<typeof computeView> }) {
  if (fig.chartType === "table") return null;
  let head: string[] = [];
  let rows: (string | number | null)[][] = [];
  if (fig.chartType === "scatter") {
    head = ["Land", fig.axisLabels?.x ?? "x", fig.axisLabels?.y ?? "y"];
    rows = fig.series.flatMap((s) => s.points ?? []).map((p) => [p.label, p.x, p.y]);
  } else if (fig.xType === "category") {
    head = ["", ...fig.series.map((s) => s.name)];
    rows = (fig.categories ?? []).map((c, i) => [c, ...fig.series.map((s) => s.values?.[i] ?? null)]);
  } else {
    const series = cv.series;
    const times = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.t)))).sort((a, b) => b - a).slice(0, 24);
    const maps = series.map((s) => new Map(s.points.map((p) => [p.t, p.v])));
    head = ["Tímabil", ...series.map((s) => s.def.name)];
    rows = times.map((t) => [formatPeriod(t, cv.frequency), ...maps.map((m) => m.get(t) ?? null)]);
  }
  return (
    <details className="data-table">
      <summary>Sýna gögn sem töflu{fig.xType === "time" ? " (nýjustu 24 tímabil)" : ""}</summary>
      <div className="data-table__scroll">
        <table className="fig-table fig-table--data">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col" className={i > 0 ? "num" : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row">
                      {c}
                    </th>
                  ) : (
                    <td key={ci} className="num">
                      {typeof c === "number" ? formatNumber(c) : c ?? "–"}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

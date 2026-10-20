# betrihagvisar

**Hagvísar, freed from the page.** An interactive web version of the *Hagvísar* report from Seðlabanki Íslands: ten Roman-numeral chapters, numbered figures, notes and sources, plus search and filters, spotlight view, drag-and-drop arrangement, personal figure sets, simulated electronic-ID login and simulated e-mail updates.

> **The figures show Seðlabanki's published numbers** (the "Tölur í myndir" workbooks for each chapter), converted to JSON by `scripts/hagvisar/build_data.py`. Login and e-mail are still simulated; nothing leaves the browser.

## Data

The bank publishes one xlsx workbook per chapter (URLs in `scripts/hagvisar/sources.json`). Its server sends no CORS headers, so the browser cannot read the workbooks directly; a Python script turns them into static JSON that the site loads:

```bash
pip install -r scripts/hagvisar/requirements.txt
python scripts/hagvisar/build_data.py            # download all ten workbooks and rebuild public/data (about 10 s)
python scripts/hagvisar/build_data.py --check    # exit 0: unchanged, exit 10: a workbook changed on the server
python scripts/hagvisar/build_data.py --local DIR  # parse workbooks you have already downloaded
```

Output in `public/data/`:

| File | Contents |
|---|---|
| `catalogue.json` | Every figure: id, chapter, title, subtitle, note, sources, left and right axis units, series names and axes, x-axis type and frequency, first and last observation, last-modified date. Loaded once when the app starts. |
| `figures/<id>.json` | `x` (ISO dates, or category labels) and one array of values per series. Fetched the first time a figure is drawn. |
| `manifest.json` | Per workbook: URL, ETag, Last-Modified, sha256 and figure ids. Used by `--check`. |

Each sheet carries its metadata in labelled rows (Fs. title, Ufs. subtitle, Nm. note, H. sources, Vá./Há. left/right unit, Ath. comment), or by position in chapters without labels. The x-axis is normalised to dates when the sheet uses dates, years, quarters ("2. ársfj. 2026", "2005F1", "2002:1"), months or two-month periods, and is otherwise kept as categories. Odd sheets are fixed in `scripts/hagvisar/overrides.json`; the script prints a note for every sheet it had to treat specially. Sheets the bank publishes without data (licensed sources: VI-15, VIII-18, X-33 to X-36) are listed with the bank's note instead of a chart; values for them can be supplied as CSV in `scripts/hagvisar/supplements/` (see the README there).

The workbooks contain no chart definitions. How each figure is drawn (lines, bars, stacking, areas, colours, second axis) lives in `src/data/figureStyles.ts`, taken from the printed report (`docs/HV_desember 2022.pdf`), keyed by figure id and series position. Figures without an entry get sensible defaults.

**Updating.** A new release only needs new URLs in `sources.json`. An update service can run `build_data.py --check || build_data.py` on a schedule and commit or upload `public/data`; the site picks up new JSON without a rebuild.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (by default `http://localhost:5173/betrihagvisar/`).

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## Deploy to GitHub Pages (project repository)

The app is configured to live at `https://<user>.github.io/betrihagvisar/`, separate from your main `<user>.github.io` site.

1. Create a repository named **`betrihagvisar`** and push this project to the `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`. It sets the base path from the repository name, so renaming the repo still works.

Routing uses hash URLs (`…/betrihagvisar/#/figure/I-1`), so deep links work on Pages without any 404 fallback.

To host somewhere else, build with a different base path, e.g. `VITE_BASE=/ npm run build`.

## What to try

| Area | Where |
|---|---|
| All chapters on one continuous page; the rail (or the selector on small screens) jumps between them, clears any filters, and follows the scroll. Chapters draw their figures only when they come near the viewport, and each chart fetches its data when it is about to be shown | Flokkar → any chapter |
| Síur og leit drawer (search, chapters, period coverage, frequency, type, source) | *Síur og leit* below the chapter rail |
| Arrange mode (drag handle, keyboard, or ··· menu: Færa fremst/ofar/neðar/aftast) | Set → *Raða myndum* (own sets only; the chapters keep the report's order) |
| Spotlight: period, series, rebasing of index figures, frequency, CSV, shareable link | ↗ on any figure, or click its title |
| Demo login (3 identities with different states) | *Skrá inn* |
| Personal sets, aðalmynd, add figures, rename, delete | *Mín söfn* |
| Update subscriptions + "Herma eftir uppfærslu" test tool | Set → *Uppfærslur*, or the *Uppfærslur* page |

Demo identities: **Gunnar** (three sets), **Sigríður** (sets with subscriptions on), **Anna** (new user, no sets). Everything is stored in `localStorage` under the `betrihagvisar:` prefix; clear site data to reset.

## Structure

```
src/
  data/        chapters, catalogue loader (figures.ts), per-figure chart styles (figureStyles.ts)
  lib/         transforms (YoY/MoM/rebase/aggregation), ECharts options, filters, formatting, CSV
  services/    AuthProvider, SetRepository, NotificationService + mock implementations
  state/       app contexts (auth, sets, filters, toasts)
  components/  TopNav, ChapterRail, FigurePanel, ChartFrame, FigureLegend, FigureGrid (dnd-kit),
               FilterDrawer, ArrangeToolbar, Drawer, Menu, AddToSetPopover, AddFigureDrawer, NotificationDrawer
  pages/       Overview, ChapterStream (all chapters), Search, Spotlight, Sets, Set detail, Login, Updates, About
  styles/      tokens, base, layout, figure, overlays, pages (plain CSS)
public/data/   generated JSON (see Data)
public/brand/  Seðlabanki's HAGVÍSAR wordmark and landvættir illustration (from sedlabanki.is/hagvisar)
scripts/       hagvisar/build_data.py and its sources, overrides and requirements
docs/          the design & Figma handoff specification, and the December 2022 report used as chart reference
```

The service interfaces in `src/services/` are the seams for production: swap `MockAuthProvider` for an Auðkenni/OIDC client, `LocalStorageSetRepository` for a user-set API and `MockNotificationService` for a real e-mail backend without touching the UI.

Stack: React 18, TypeScript, Vite, React Router (hash), Apache ECharts (SVG renderer), dnd-kit.

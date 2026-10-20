# Hagvísar Web App — Design & Frontend Implementation Specification

**Status:** Draft v0.1  
**Purpose:** Design handoff for implementation in React/TypeScript (or similar), suitable to give directly to Codex.  
**Primary goal:** Reimagine the old *Hagvísar* report as a modern, interactive, Nordic-minimalist web application where the figures are the main content.

---

## 1. Product concept

The product should feel like **“Hagvísar, freed from the page.”**

It should preserve the strongest qualities of the old printed report:

- clear chapter structure,
- compact figure numbering,
- restrained typography,
- white space,
- figures as the dominant content,
- short methodological notes and source lines,
- a quiet institutional visual language.

At the same time, it should add modern web behavior:

- search and filtering,
- interactive charts,
- figure spotlight / enlargement,
- reordering via drag-and-drop,
- saved custom sets of figures,
- simulated login for the demo,
- simulated update subscriptions for the demo,
- responsive mobile behavior.

The interface must **not** feel like Power BI, Tableau, or a generic analytics dashboard.

---

## 2. Design direction

### 2.1 Overall mood

Keywords:

- Nordic minimalism
- editorial
- institutional but modern
- calm
- high-information density without visual clutter
- print-inspired
- white-first
- charts provide most of the color

### 2.2 Visual hierarchy

The visual priority should be:

1. Figure / chart
2. Figure title
3. Section / chapter identity
4. Figure controls
5. Metadata / notes / sources
6. Global navigation

Avoid decorative UI that competes with the charts.

### 2.3 What to borrow from the old report

Keep the conceptual structure of the printed *Hagvísar* report:

- Roman numeral sections (`I`, `II`, `III`, ...)
- figure IDs such as `I-1`, `VI-2`, `VIII-8`
- section heading + thin horizontal rule
- concise chart titles
- units immediately above or near the plot
- legends directly under figures
- explanatory notes and sources below
- clean 2-column figure rhythm on desktop

Do **not** reproduce the PDF literally. Use it as an editorial grammar.

---

## 3. Core design principle: two visual modes

There are two related but intentionally different page styles.

### 3.1 Public report / chapter view

This is the closest descendant of the old report.

It should include:

- left chapter navigation,
- section title and optional description,
- figure numbers,
- source notes,
- chapter context,
- a structured 2-column grid on desktop.

This view is slightly more editorial and informative.

### 3.2 “My sets” / custom set view

This should be **lighter and more personal**.

Use fewer chapter descriptions and less editorial scaffolding.

The user already chose the figures, so the interface should mainly show:

- set title,
- small metadata line,
- reorder button,
- add-figure button,
- email update controls,
- figures.

Do not repeat full chapter descriptions or heavy section headers unless they add meaning.

This distinction is important.

---

# 4. Information architecture

## 4.1 Primary navigation

Desktop header:

- **HAGVÍSAR** wordmark
- Overview / Yfirlit
- Categories / Flokkar
- My figures / Mínar myndir or Mín söfn
- Updates / Uppfærslur
- About / Um
- Global search
- User avatar / login

Keep the header thin and quiet.

## 4.2 Chapter navigation

Desktop public view gets a left rail with the ten classic sections:

1. Verðlagsþróun og verðbólguvæntingar
2. Framleiðsla og eftirspurn
3. Utanríkisviðskipti og ytri skilyrði
4. Vinnumarkaður og tekjur
5. Opinber fjármál
6. Eignamarkaðir
7. Heimili og fyrirtæki
8. Fjármálamarkaðir
9. Fjármálakerfið
10. Alþjóðleg efnahagsmál og erlendur samanburður

On mobile, replace this rail with a compact category selector.

---

# 5. Page layouts

## 5.1 Public chapter page — default

Desktop composition:

```text
┌────────────────────────────────────────────────────────────────────┐
│ HAGVÍSAR       Yfirlit  Flokkar  Mín söfn ...      Search   User │
├───────────────┬────────────────────────────────────────────────────┤
│ I Prices      │ I   Verðlagsþróun og verðbólguvæntingar          │
│ II Output     │     short optional chapter description            │
│ III ...       │                                                    │
│               │ [ Síur og leit ] [ Raða myndum ]                  │
│               │                                                    │
│               │ ┌────────────────┐ ┌────────────────┐             │
│               │ │ I-1 Figure     │ │ I-2 Figure     │             │
│               │ │ chart          │ │ chart          │             │
│               │ └────────────────┘ └────────────────┘             │
│               │                                                    │
│               │ ┌────────────────┐ ┌────────────────┐             │
│               │ │ I-3 Figure     │ │ I-4 Figure     │             │
│               │ └────────────────┘ └────────────────┘             │
└───────────────┴────────────────────────────────────────────────────┘
```

Recommended desktop content width: ~1180–1320 px.

The figure grid is 2 columns by default. A 3-column layout may be used only on very wide screens if figure readability remains excellent.

## 5.2 Custom set page

```text
Peningastefna                                      [ Skoða ] [ Stillingar ]
6 myndir · síðast breytt ...

[ + Bæta við mynd ]   [ Raða myndum ]   [ Uppfærslur ]

┌─────────────────────┐  ┌─────────────────────┐
│ VIII-8              │  │ I-1                 │
│ Vextir ...          │  │ Verðbólga           │
│ chart               │  │ chart               │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ I-2                 │  │ I-14                │
│ ...                 │  │ ...                 │
└─────────────────────┘  └─────────────────────┘
```

Important: no left chapter rail by default. This should feel like a personal report page rather than a category browser.

---

# 6. Figure component

## 6.1 Default figure anatomy

Every figure should use the same component structure:

```text
I-1                                     ☆   ↗   ···
Verðbólga
12 mánaða breyting (%)

[ CHART ]

— Vísitala neysluverðs
— VNV án húsnæðis
— Kjarnavísitala 3
--- Verðbólgumarkmið

Mánaðarlegar tölur.
Heimildir: Hagstofa Íslands, Seðlabanki Íslands.
```

### Required elements

- figure ID
- title
- unit / transformation label
- chart
- legend
- optional note
- source line
- save action
- spotlight action
- overflow menu

### Styling

The default figure should **not look like a floating dashboard card**.

Use:

- white canvas,
- subtle 1 px border only when helpful,
- little or no border radius,
- no heavy shadow,
- generous internal whitespace,
- restrained iconography.

In public chapter view, figure boundaries can be subtle but visible enough to support interaction.

---

# 7. “Síur og leit” — expanded filter experience

## 7.1 Trigger

Primary button near the chapter heading:

`Síur og leit`

Show a small active-count badge when filters are applied:

`Síur og leit · 2`

## 7.2 Desktop behavior

Open a **right-side drawer/panel** over the page or docked beside the content.

Preferred width: ~420–520 px.

Do not navigate away from the figures.

The current page should remain visible so users understand what they are filtering.

## 7.3 Drawer structure

### Search

- text input
- searches title, tags, series names, figure ID, source

Placeholder example:

`Leita að mynd, t.d. verðbólga, húsnæði, laun...`

### Categories

Checkboxes for the ten chapters.

Allow multiple selection.

### Time period

Quick presets:

- 1Y
- 5Y
- 10Y
- Allt
- Sérsniðið

For custom range:

- From date
- To date

Important distinction: on the browse page, this filter primarily determines whether a figure is relevant / available for the chosen interval. It should **not silently mutate every chart's transformation**.

### Data frequency

Checkboxes:

- Dagleg
- Vikuleg
- Mánaðarleg
- Ársfjórðungsleg
- Árleg

### Figure type

Checkboxes:

- Línurit
- Súlurit
- Flatarmál
- Dreifirit
- Tafla
- Kort
- Aðrar gerðir

### Source

- Hagstofa Íslands
- Seðlabanki Íslands
- Eurostat
- OECD
- IMF
- other sources as needed

### Footer actions

- `Hreinsa allt`
- primary button: `Sýna X myndir`

## 7.4 Mobile behavior

Use a full-width sheet-like page section, not a tiny side panel.

Filters should be grouped into accordions.

---

# 8. Reorder mode — drag and drop

## 8.1 Entry

Button:

`Raða myndum`

Clicking it switches the figure area into an explicit edit state.

Do not make the normal browsing page permanently draggable.

## 8.2 Visual changes in reorder mode

- figure cards gain a visible drag handle (`⋮⋮` or six-dot grip)
- slightly stronger border
- hover / selected state
- top information strip:
  - `Dragðu og slepptu myndum til að breyta röðinni.`
- top actions:
  - `Vista röð`
  - `Hætta við`
  - optional `Endurstilla`

## 8.3 Drag behavior

When dragging:

- dragged figure lifts slightly with subtle shadow
- original slot becomes a placeholder
- target location uses a teal dashed outline / drop zone
- surrounding figures animate into new positions
- preserve chart thumbnail while dragging

### Desktop

Allow drag by the handle only.

### Touch / mobile

Use press-and-hold on handle.

Also provide accessible alternatives in the overflow menu:

- Move up
- Move down
- Move to top
- Move to bottom

## 8.4 Persistence

Demo:

- store order in `localStorage`

Production later:

- persist via user-set API

---

# 9. Spotlight mode

## 9.1 Purpose

Spotlight makes one figure the main object of the page.

This should feel more like opening a figure in an editorial reading view than opening a modal.

## 9.2 Preferred behavior

Click the diagonal-expand icon.

The selected chart expands into a large inline area.

Desktop:

```text
← Til baka

I-1   Verðbólga
      12 mánaða breyting (%)

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     LARGE CHART                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legend

Methodological note
Sources

                          ┌─────────────────────┐
                          │ Stillingar          │
                          │ 1Y 5Y 10Y Allt      │
                          │ series toggles      │
                          │ transformation      │
                          │ frequency           │
                          └─────────────────────┘

[ Sækja gögn ] [ Afrita tengil ] [ Bæta í mitt safn ]
```

## 9.3 Spotlight controls

- quick period: 1Y / 5Y / 10Y / Allt
- custom dates
- series visibility checkboxes
- transformation selector when meaningful:
  - Level
  - YoY
  - MoM
  - index rebasing
- frequency selector if alternative frequencies exist
- download data (CSV)
- copy/share link
- add to set

## 9.4 Navigation

Optional previous / next figure links:

`← Fyrri mynd`  `Næsta mynd →`

This makes the page usable as a report reader.

---

# 10. Own sets / “Mín söfn”

## 10.1 Set list page

Show compact rows/cards:

```text
Peningastefna
6 myndir · Uppfært 17. okt. 2026                 ···
[mini thumbnails]

Húsnæðismarkaður
8 myndir · Uppfært 12. okt. 2026                 ···
```

Avoid long descriptions.

## 10.2 Set detail page

Primary controls:

- rename set
- add figure
- reorder figures
- configure updates
- delete set

Optional permanent spotlight figure.

If a set has a spotlight figure, render it large at the top and the remaining figures below.

## 10.3 Add-to-set interaction

From any figure:

`☆ Bæta í safn`

Popover:

- existing sets
- create new set

Demo persistence uses localStorage.

---

# 11. Mock authentication for demo

The demo may simulate Auðkenni / rafræn skilríki, but it must be clearly labeled as a simulation.

## 11.1 Login screen

Primary action:

`Innskrá með rafrænum skilríkjum`

Secondary demo action:

`Prófa innskráningu (demo)`

Include a visible note:

> Þetta er sýnidæmi. Engin raunveruleg auðkenning fer fram.

## 11.2 Demo users

Provide 2–3 predefined demo identities with different set states.

Example:

- new user, no sets
- user with several saved sets
- user with subscriptions enabled

The rest of the app should consume a normalized user object rather than knowing whether auth is mocked.

---

# 12. Update subscriptions — demo UI

No real email is required for the first demo.

Users should be able to configure:

- notify when any figure in a set updates
- notify for selected figures
- immediate update
- daily digest
- weekly digest

Demo confirmation:

`Uppfærslur vistaðar. Í framleiðslu myndi tölvupóstur berast þegar ný gögn birtast.`

Optional demo action:

`Simulate update`

This can visually mark a figure as updated and show a fake “email queued” notification.

---

# 13. Chart visual system

## 13.1 Chart library

Recommended implementation:

- Apache ECharts

Alternative:

- Plotly.js

Prefer ECharts for the first implementation.

## 13.2 Plot style

Default chart behavior:

- white background
- very light dotted or dashed horizontal grid
- thin axes
- restrained tick labels
- 2–5 visible series ideally
- no unnecessary chart chrome
- legends below chart
- tooltips on hover/tap
- responsive axes

## 13.3 Data palette

The interface accent and the data palette are separate systems.

Suggested chart colors:

- deep blue / teal
- burnt orange
- muted red
- pale blue
- olive / yellow
- muted green
- neutral grey

Avoid rainbow palettes.

When more than ~6 series exist, use line style, opacity, or direct labeling in addition to color.

---

# 14. Design tokens

Initial values; tune in Figma/browser.

## Colors

```css
--canvas: #ffffff;
--paper: #f7f8f5;
--text: #18211f;
--muted: #68736f;
--hairline: #dce2df;
--gridline: #d8deda;
--accent: #0f6b63;
--accent-soft: #e9f3f1;
--danger: #9b3f3f;
```

The exact accent should be visually compatible with the Seðlabanki / Hagvísar green, but not necessarily identical.

## Typography

Use a two-level typography system:

### UI

Clean sans-serif such as:

- Inter
- Source Sans 3
- system sans fallback

### Editorial headings

Optional serif for large chapter titles / spotlight title:

- Source Serif 4
- Georgia fallback

Do not use serif everywhere.

## Spacing

Use an 8 px system:

- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64

## Radius

Minimal:

- controls: 4–6 px
- panels: 4–8 px
- figures: 0–6 px

Avoid overly rounded “app card” styling.

---

# 15. Responsive behavior

## Desktop >= 1100 px

- left chapter rail in public report view
- 2-column figure grid
- right-side filter drawer
- spotlight settings panel beside chart

## Tablet 700–1099 px

- collapsible category navigation
- 2 columns where chart width remains readable
- filter drawer may overlay content

## Mobile < 700 px

- one figure per row
- chapter navigation becomes selector
- filter panel becomes full-width sheet/section
- spotlight uses full width
- chart controls wrap below the chart
- reorder mode stays one column

No horizontal page scrolling.

---

# 16. Motion and micro-interactions

Use motion sparingly.

Recommended:

- 150–220 ms UI transitions
- reorder movement with spring-like but restrained motion
- spotlight expansion can animate from original card position
- filter count updates immediately

Avoid decorative continuous motion.

Respect `prefers-reduced-motion`.

---

# 17. Demo frontend technical architecture

Recommended stack:

- React
- TypeScript
- Vite
- React Router
- Apache ECharts
- dnd-kit for drag-and-drop
- CSS Modules, Tailwind, or plain modern CSS

Do not require a backend for the first visual demo.

## Demo services

Implement these interfaces:

```ts
interface AuthProvider {
  login(): Promise<UserIdentity>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserIdentity | null>;
}

interface SetRepository {
  list(): Promise<FigureSet[]>;
  get(id: string): Promise<FigureSet | null>;
  save(set: FigureSet): Promise<void>;
  remove(id: string): Promise<void>;
}

interface NotificationService {
  savePreferences(input: NotificationPreferences): Promise<void>;
}
```

Demo implementations:

- `MockAuthProvider`
- `LocalStorageSetRepository`
- `MockNotificationService`

This makes the production backend replaceable later.

---

# 18. Suggested frontend data model

```ts
export type FigureDefinition = {
  id: string;               // e.g. "I-1"
  slug: string;             // e.g. "inflation"
  sectionId: string;        // e.g. "I"
  title: string;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  chartType: "line" | "bar" | "area" | "scatter" | "table";
  tags: string[];
  sources: string[];
  note?: string;
  series: SeriesDefinition[];
};

export type FigureSet = {
  id: string;
  name: string;
  figureIds: string[];
  spotlightFigureId?: string;
  updatedAt: string;
};
```

---

# 19. Routing

Suggested demo routes:

```text
/                         overview
/section/I                public chapter
/figure/I-1               spotlight figure
/sets                      my sets
/sets/:setId               custom set
/login                     mock login
/updates                   subscription settings
```

If deployed under GitHub Pages subpath, configure Vite base correctly and either use hash routing or a Pages-compatible SPA fallback.

---

# 20. Important interaction states

Codex implementation should explicitly include:

- default
- hover
- keyboard focus
- selected
- loading
- no data
- error
- updated / new data available
- filtered empty state
- reorder mode
- dragging
- spotlight mode
- logged out
- logged in

---

# 21. Accessibility requirements

- all controls keyboard reachable
- visible focus states
- drag-and-drop must have non-drag alternatives
- minimum touch target about 44 px
- color must not be the only series discriminator where practical
- chart data should have accessible summary text or table fallback
- sufficient text contrast
- semantic headings
- reduced-motion support

---

# 22. What should NOT be built

Avoid:

- Power BI-style sidebars permanently taking up space
- giant KPI tiles
- gradients
- glassmorphism
- heavy shadows
- excessive rounded cards
- decorative illustrations competing with charts
- dozens of persistent chart buttons
- filters that obscure the figures by default
- permanently draggable figures
- dense “enterprise dashboard” chrome

---

# 23. Implementation priority

## Phase A — visual prototype

1. header
2. chapter rail
3. public chapter view
4. reusable Figure component
5. 4–6 fake figures with representative data
6. filter drawer
7. spotlight mode
8. reorder mode

## Phase B — personalization demo

9. mock login
10. set list
11. set detail page
12. add figure to set
13. localStorage persistence
14. simulated notification settings

## Phase C — production integration later

15. real API
16. user database
17. Auðkenni/OIDC integration
18. actual update detection
19. email provider

---

# 24. Acceptance criteria for first polished prototype

The prototype is successful when:

- at first glance it looks like a modern descendant of the old Hagvísar report,
- charts dominate the visual composition,
- the public report view and custom-set view feel related but not identical,
- filters can be opened without navigating away,
- figures can be reordered only after entering arrange mode,
- drag-and-drop has clear visual feedback,
- any figure can enter spotlight mode,
- spotlight exposes deeper chart controls without cluttering the default view,
- custom sets can be created and saved locally,
- the demo login clearly simulates electronic-ID authentication,
- the site works cleanly on mobile,
- nothing resembles a generic Power BI dashboard.

---

# 25. Short prompt to give Codex

Use this together with the full specification:

> Build a polished frontend prototype for a web application called **Hagvísar** using React, TypeScript, Vite and Apache ECharts. Follow `hagvisar_design_spec.md` closely. The visual language should be Nordic-minimalist and editorial, inspired by the old printed Hagvísar report rather than Power BI. Use a white-first layout, restrained teal interface accents, thin rules, compact figure IDs, source notes, and chart-focused composition. Implement the public chapter view, reusable figures, expandable “Síur og leit” drawer, explicit drag-and-drop arrange mode using dnd-kit, inline spotlight view, mock login, and localStorage-backed custom figure sets. Use representative fake data. Prioritize visual quality, responsive layout, accessibility, and clean component architecture. Do not add generic dashboard KPI cards, gradients, heavy shadows, glass effects, or persistent chart-control clutter.

# Hagvísar Web App — Figma / UI Component Specification

**Status:** Draft v0.1  
**Companion to:** `hagvisar_design_spec.md`  
**Purpose:** Precise visual and interaction handoff for Figma and frontend implementation.  
**Primary reference direction:** Use the first mock-up as the public/report view. Use the lighter, less editorial treatment from the second mock-up for personal sets.

---

## 1. Design intent

The interface should feel like a modern continuation of the old *Hagvísar* publication rather than a BI dashboard.

The central visual idea is:

> **The page is a quiet white canvas; the figures carry the information and most of the color.**

Public chapter pages retain publication structure: Roman-numeral chapters, compact figure IDs, notes, sources, and a strong two-column rhythm. Personal sets remove most chapter scaffolding and behave like a clean, movable page assembled by the user.

Avoid dashboard tropes: thick cards, strong shadows, gradients, bright status colors, dense control bars, decorative KPI tiles, or large colored backgrounds.

---

# 2. Figma file structure

Use these pages in the Figma file:

```text
00 · Cover + Direction
01 · Foundations
02 · Chart System
03 · Components
04 · Public / Desktop
05 · My Sets / Desktop
06 · Interaction States
07 · Mobile
08 · Prototype Flows
09 · Dev Handoff
```

### 00 · Cover + Direction

Include:

- short product statement: “Hagvísar, freed from the page”
- 3–5 screenshots/crops from the old report for visual reference
- the preferred public-page mock-up
- the lighter personal-set mock-up
- 5 keywords: **editorial / Nordic / quiet / precise / figure-first**
- a “Do not become” strip: Power BI / generic admin dashboard / card-heavy analytics UI

---

# 3. Base frames and responsive targets

Design and test these canonical frames.

| Target | Figma frame | Notes |
|---|---:|---|
| Wide desktop | 1440 × 1024 | primary design target |
| Large desktop | 1728 × 1117 | validate spacing, optional docked filter drawer |
| Compact desktop/tablet landscape | 1024 × 900 | chapter rail may collapse |
| Tablet portrait | 768 × 1024 | one-column figure flow |
| Mobile | 390 × 844 | primary mobile target |
| Small mobile | 320 × 720 | must remain usable without horizontal page scroll |

Do not design the app around a fixed viewport height. Content should scroll naturally.

---

# 4. Layout grid

## 4.1 Desktop public view — 1440 px

```text
24 page margin
208 chapter rail
24 gutter
remaining content area
24 page margin
```

Recommended dimensions:

- top navigation height: **68 px**
- left chapter rail: **208 px**
- gap rail → content: **24 px**
- content max width: **1120–1160 px**
- figure grid gap: **24 px horizontal / 28 px vertical**
- default figure columns: **2**
- content top padding below header: **28 px**
- section header → control row: **24 px**
- control row → first figures: **20 px**

Each grid child must have `min-width: 0` in implementation.

## 4.2 Public view below 1100 px

- collapse chapter rail into a compact category dropdown / drawer
- keep figures in 2 columns only while each figure remains at least ~420 px wide
- otherwise switch to 1 column

## 4.3 Personal set view

No persistent chapter rail.

Use:

```text
max content width: 1180–1240 px
page side padding: 24–32 px desktop
2-column figure grid
```

The page should feel more open than the public chapter view.

---

# 5. Design tokens

These are starting values, not brand-law. Keep them consistent unless a later design pass changes them.

## 5.1 Color

```css
--bg:                #FFFFFF;
--surface-subtle:    #F6F8F6;
--surface-muted:     #EEF3F0;

--text-primary:      #15201D;
--text-secondary:    #67716D;
--text-tertiary:     #89918E;

--line:              #D9E1DD;
--line-strong:       #BBC7C1;

--accent:            #0B6B62;
--accent-hover:      #075A53;
--accent-soft:       #E9F3F0;

--focus:             #0B6B62;
--danger:            #A84747;
```

### Chart palette

Use chart colors for data, not general interface decoration.

```css
--series-1: #0F5066;   /* deep blue-teal */
--series-2: #E47A2E;   /* burnt orange */
--series-3: #7399B8;   /* soft blue */
--series-4: #A65061;   /* muted red */
--series-5: #A4A548;   /* olive */
--series-6: #78817D;   /* neutral gray */
```

Rules:

- use accent green mainly for navigation, selection, focus, and controls
- do not make every chart line green
- avoid rainbow palettes unless the chart genuinely has many categorical series
- never use gradients in ordinary charts

## 5.2 Typography

Preferred free/open-source pairing:

- **UI / body:** Inter
- **Editorial headings:** Source Serif 4

Fallbacks:

```css
--font-ui: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-editorial: "Source Serif 4", Georgia, "Times New Roman", serif;
```

Type scale:

| Role | Size / line-height | Weight |
|---|---|---|
| Wordmark | 22 / 24 | 600, tracking +0.08em |
| Chapter Roman numeral | 40 / 44 | 500 serif |
| Chapter title | 32 / 38 | 500 serif |
| Page title in My Sets | 30 / 36 | 500 serif |
| Figure title | 17 / 22 | 600 serif or UI semibold |
| Figure ID | 12 / 16 | 500 UI |
| Body | 15 / 22 | 400 |
| Control | 14 / 20 | 500 |
| Chart metadata | 12 / 17 | 400 |
| Source / note | 11.5–12 / 16 | 400 |

Use tabular numerals for chart axes, values, dates, and counts.

## 5.3 Spacing

Use a 4 px base system.

```text
4  8  12  16  20  24  32  40  48  64
```

Default component spacing should favor 12 / 16 / 24 rather than tiny 4–8 px gaps everywhere.

## 5.4 Radius and elevation

- figure default radius: **4 px** or **0 px**; choose once and stay consistent
- buttons/inputs: **4–6 px**
- drawers/dialogs: **6 px**
- no shadow on normal figures
- floating drag preview: subtle shadow allowed
- modal/drawer: one restrained shadow allowed

---

# 6. Top navigation

Desktop height: **68 px**.

Layout:

```text
HAGVÍSAR     Yfirlit  Flokkar  Mín söfn  Uppfærslur  Um       Search     User
```

### Wordmark

- text only for prototype unless a real mark is supplied
- small supporting line may read `Hagtölur Íslands í samhengi`
- do not make header visually dominant

### Active navigation

Use one of:

- 2 px underline in accent
- dark text + tiny accent rule

Do not use filled pills for primary nav.

### Search

Desktop:

- width: 240–300 px
- height: 38–40 px
- placeholder: `Leita að myndum…`

Mobile: search moves into the page or menu.

---

# 7. Public chapter rail

Width: **208 px**.

Each item:

```text
I     Verðlagsþróun og verðbólga
II    Framleiðsla og eftirspurn
...
```

Dimensions:

- item min-height: 40 px
- Roman numeral column: 26–30 px
- text: 13–14 px
- active row: `--accent-soft`
- active left rule: 2 px `--accent`
- inactive rows: transparent

No boxed sidebar container. It sits directly on the page.

On mobile/compact layouts, replace with a chapter selector button:

`I · Verðlagsþróun og verðbólguvæntingar ▾`

---

# 8. Public section header

Desktop anatomy:

```text
I    Verðlagsþróun og verðbólguvæntingar                     19 myndir
     Optional one-line explanatory sentence                   Updated …
──────────────────────────────────────────────────────────────────────
```

Dimensions:

- Roman numeral block: 40–52 px wide
- short accent rule above or beside title: 36–44 px
- title max width: ~760 px
- optional description max width: 760 px
- thin rule: 1 px `--line`

Do not use a colored title banner.

---

# 9. Public action row

Place immediately below section header.

Desktop preferred controls:

```text
[ Síur og leit ]   [ Raða myndum ]                            [ Raða eftir ▾ ]
```

Optional result text:

`19 myndir`

Do not keep all individual filter chips visible by default. The clean default state is important.

---

# 10. Figure component

## 10.1 Default public figure

Recommended desktop size at 1440 layout:

- width: fluid, approximately **540–565 px**
- min height: **330 px**
- typical height: **360–390 px** depending on notes
- internal padding: **16 px**

Anatomy:

```text
I-1                                             ☆   ↗   ···
Verðbólga
12 mánaða breyting (%)

[ plot: ~190–220 px high ]

legend

Mánaðarlegar tölur.
Heimildir: Hagstofa Íslands, Seðlabanki Íslands.
```

### Figure header

- ID at top-left
- title immediately below or on same vertical group
- actions top-right
- unit/subtitle in muted text below title

### Actions

Default actions:

- ☆ add/save
- ↗ spotlight
- ··· more

Actions should be low-emphasis until hover/focus, but always have accessible hit targets of roughly 40×40 px.

### Figure boundary

Preferred:

- very subtle 1 px border `--line`
- white background
- no shadow

Alternative allowed: no outer border, but then use stronger vertical rhythm between figures. Do not mix both styles on the same page.

---

# 11. Chart system

The charts should deliberately echo the old report while becoming cleaner and interactive.

## 11.1 Plot styling

- white plot background
- gridlines: thin, light gray, dotted or dashed
- axis text: 11–12 px
- primary lines: 1.8–2.2 px
- reference/target lines: 1–1.5 px dashed
- markers: off by default for dense time series
- markers appear on hover/selection when useful
- zero line may be slightly stronger than other gridlines

## 11.2 Legend

- below plot by default
- horizontal with wrapping
- series swatch + label
- 11.5–12 px text
- clicking a legend item may toggle the series in spotlight mode
- in compact grid view, legend toggling is optional; avoid making the grid figure too interactive

## 11.3 Tooltip

Tooltip should look like a small publication annotation:

```text
Oct. 2026
VNV                    4.2%
VNV án húsnæðis        3.6%
Verðbólgumarkmið       2.5%
```

Style:

- white surface
- 1 px border
- no colored tooltip background
- subtle shadow only if needed for separation
- 12–13 px
- value column tabular and aligned

## 11.4 Loading

Use a quiet skeleton inside the plot region only. Keep title/metadata stable.

## 11.5 No data / error

Do not show a generic red error card.

Use:

`Engin gögn fundust fyrir valið tímabil.`

or

`Ekki tókst að sækja gögn.`

with a small retry action where appropriate.

---

# 12. Síur og leit — expanded behavior

The public page starts with the drawer closed.

Button label:

`Síur og leit`

If active filters exist:

`Síur og leit (3)`

## 12.1 Desktop behavior

At 1440 px:

- drawer slides in from the right
- width: **420 px**
- max width: **calc(100vw - 48px)**
- height: viewport/page shell height below browser chrome; page itself can remain scrollable
- underlying content becomes inert while drawer is modal-style
- use a very light scrim; avoid a dramatic dark modal overlay
- left chapter rail remains visually visible behind the scrim

At very wide desktop (roughly >=1600 px), an optional implementation may dock the drawer without a scrim if the remaining chart area still preserves readable figure widths.

Mobile: use a full-width bottom sheet / full-screen sheet instead of a narrow drawer.

## 12.2 Drawer header

```text
Síur og leit                                      ×
```

Optional tabs are allowed only if needed:

```text
Leit | Síur
```

Preferred v1: keep search at top and all filters in one scrollable pane.

## 12.3 Drawer structure

Order:

```text
Search

Flokkar
Tímabil
Tíðni gagna
Tegund myndar
Heimild

[ Hreinsa allt ]                 [ Sýna 14 myndir ]
```

### Search

Input height: 42 px.

Placeholder:

`Leita að myndum, t.d. húsnæði, laun, vextir…`

Search matches title, figure ID, chapter, source, and optional keywords.

### Flokkar

Use checkboxes.

Show first ~5 categories and a `Sýna fleiri…` disclosure if needed.

Do not turn chapter filters into colorful tags.

### Tímabil

Quick presets:

```text
[ 1Á ] [ 5Á ] [ 10Á ] [ Allt ] [ Sérsniðið ]
```

For catalogue filtering, this means “figures with data covering this requested span” or can be omitted in v1 if that semantics is not yet useful. In spotlight mode it controls the actual plotted period.

Custom:

```text
Frá [ date ]     Til [ date ]
```

### Tíðni gagna

Checkboxes:

- Dagleg
- Vikuleg
- Mánaðarleg
- Ársfjórðungsleg
- Árleg

### Tegund myndar

Checkboxes:

- Línurit
- Súlurit
- Flatarmál
- Dreifirit
- Tafla

This filters the catalogue; it does **not** convert one chart type into another.

### Heimild

Preferred first implementation: multi-select checkboxes, not a complex searchable dropdown.

Examples:

- Hagstofa Íslands
- Seðlabanki Íslands
- Eurostat
- OECD
- IMF

### Footer actions

Footer may be sticky inside drawer.

Primary:

`Sýna 14 myndir`

Secondary text action:

`Hreinsa allt`

Applying filters closes the drawer on desktop in v1. Preserve the filter state and show the active count on the button.

---

# 13. Arrange mode / drag-and-drop

Reordering should be explicit rather than permanently enabled.

Entry action:

`Raða myndum`

## 13.1 On entering arrange mode

Change the page chrome as follows:

- show a compact arrange toolbar below the page/section heading
- hide low-value figure actions such as save and spotlight
- show a drag handle on every figure
- strengthen figure boundaries slightly
- preserve figure sizes and layout; avoid “jumping” into a different card design

Toolbar:

```text
Dragðu og slepptu myndum til að breyta röðinni.
                                      [ Hætta við ] [ Vista röð ]
```

On a personal set, `Vista röð` persists the new ordering.

On the public default view, user-reordered layout should either:

1. persist locally as a personal preference, or
2. be disabled until the user is in a personal set.

For the demo, prefer option 1 using localStorage.

## 13.2 Drag handle

- 24–32 px visual handle
- 44 px hit target
- icon: six dots / grip
- position: upper-left of figure header
- cursor: grab / grabbing

Do not make the entire chart draggable because it interferes with chart interaction.

## 13.3 Active drag state

Dragged figure:

- rendered as a floating preview
- opacity ~0.96
- subtle shadow
- slight scale up, maximum ~1.01–1.02
- keep real chart content visible

Original slot becomes an empty placeholder.

Drop placeholder:

- dashed 1–2 px accent border
- very pale `--accent-soft` fill
- same height as dragged figure
- optional center label: `Slepptu hér`

Other figures should animate smoothly into the prospective new order.

Motion: 160–220 ms ease-out. Respect reduced-motion settings.

## 13.4 Drop behavior

Desktop 2-column grid should use sortable grid semantics, not freeform coordinates.

A drop means “insert at this index”, not “place at arbitrary x/y.”

Persist an ordered array of figure IDs:

```ts
["I-1", "I-4", "I-2", "I-7", "I-3"]
```

## 13.5 Keyboard / non-drag fallback

The overflow menu in arrange mode must offer:

- Færa fremst
- Færa ofar
- Færa neðar
- Færa aftast

For keyboard drag-and-drop, use the accessibility support provided by the chosen library (e.g. dnd-kit) and announce position changes.

---

# 14. Spotlight mode

Spotlight is the primary deep-inspection state for a figure.

It should not feel like “open card in modal.” It should feel like giving the figure the page.

## 14.1 Desktop composition

Preferred layout:

```text
← Til baka

I-1   Verðbólga
      12 mánaða breyting (%)

[ large chart ........................................ ]   [ controls ]
[ .................................................... ]   [ controls ]

legend

method note / source

[ Sækja gögn ] [ Afrita tengil ] [ Bæta í mitt safn ]
```

Use either:

- a dedicated figure route/state, or
- an inline expansion that takes the full content width.

Visually, it must be deep-linkable and look like a stable page, not a temporary pop-up.

### Large chart

- width: roughly 70–75% of content area when side controls are present
- plot height: 420–520 px desktop
- use more detailed labels/tooltips than in grid mode

### Control panel

Width: 260–300 px.

Sections:

```text
Tímabil
Raðir / series
Umbreyting
Tíðni
```

Controls may include:

- 1Y / 5Y / 10Y / Allt / Sérsniðið
- series checkboxes
- transformation dropdown: `Gildi`, `12 mánaða breyting`, `Mánaðarbreyting`, etc. only where valid
- frequency selector where valid

Do not show controls that the figure does not support.

### Metadata

Under chart:

- short methodology note
- frequency
- last updated date if available
- source(s)

Actions:

- `Sækja gögn (CSV)`
- `Afrita tengil`
- `Bæta í mitt safn`

Optional later:

- download PNG/SVG
- embed

---

# 15. Personal sets

Personal sets deliberately use less editorial framing.

## 15.1 My Sets index

Page title:

`Mín söfn`

Create action:

`+ Nýtt safn`

Set item anatomy:

```text
Peningastefna                          ···
6 myndir · Uppfært 17. okt. 2026
[small 2-chart thumbnail or mini preview]
```

Do not repeat chapter descriptions here.

Use a simple list or 2-column set grid depending on width.

## 15.2 Set detail

Header:

```text
Peningastefna ✎
6 myndir · síðast breytt 17. okt. 2026

[ + Bæta við mynd ] [ Raða myndum ] [ Uppfærslur ]
```

No left chapter rail.

No large chapter intro.

Figures retain their figure IDs and titles, but sources/notes may be visually collapsed to one concise metadata line if space is needed.

## 15.3 Spotlight figure inside a set

Allow one figure to be marked as the set’s default spotlight.

When present, layout can be:

```text
[ wide spotlight figure ..................................... ]

[ figure ] [ figure ]
[ figure ] [ figure ]
```

The spotlight figure spans two columns on desktop.

Action in figure overflow menu:

`Gera að aðalmynd`

Only one per set.

## 15.4 Add figure flow

Use a side drawer or large dialog.

Header:

`Bæta við myndum`

Include:

- search
- category filter
- compact figure previews
- multi-select checkboxes
- selected count

Footer:

`Bæta við 3 myndum`

Do not duplicate the full public browsing page inside the dialog.

---

# 16. Update subscriptions — demo UI

Entry points:

- `Uppfærslur` in set header
- update action in individual figure overflow

Panel:

```text
Fáðu uppfærslur í tölvupósti

☑ Láta mig vita þegar ný gögn birtast í þessu safni

Tíðni
○ Strax
● Daglegt yfirlit
○ Vikulegt yfirlit

Netfang
[ demo@example.is ]

[ Vista stillingar ]
```

For the demo, visibly mark:

`Sýnidæmi — enginn tölvupóstur verður sendur.`

A `Simulate update` development action may exist behind a demo/debug menu but should not be part of the normal public UI.

---

# 17. Mock Auðkenni flow

The login experience should look plausible but must not impersonate a live production service.

Entry button:

`Skrá inn með rafrænum skilríkjum`

Demo screen must visibly state:

`Sýnidæmi — raunveruleg auðkenning fer ekki fram.`

Suggested demo steps:

```text
1. Login landing
2. Choose demo identity
3. “Waiting for confirmation…” state
4. Success
5. Return to app
```

The surrounding app should treat the result like a normal authenticated session.

Do not copy real production screens pixel-for-pixel.

---

# 18. Component inventory

Codex/frontend implementation should map closely to this component tree.

```text
AppShell
├── TopNav
├── ChapterRail                 // public view only
└── MainContent
    ├── SectionHeader
    ├── PublicActionRow
    ├── FigureGrid
    │   └── FigurePanel
    │       ├── FigureHeader
    │       ├── ChartFrame
    │       ├── FigureLegend
    │       ├── FigureMeta
    │       └── FigureActions
    ├── FilterDrawer
    ├── ArrangeToolbar
    ├── DragOverlay
    └── SpotlightView

MySetsIndex
├── SetCard / SetRow
└── NewSetAction

SetDetail
├── SetHeader
├── SetActionRow
├── FigureGrid
├── AddFigureDrawer
└── NotificationDrawer

Auth
├── LoginEntry
├── DemoIdentityPicker
├── WaitingState
└── AuthSuccess
```

### Implementation rule

Do not create one huge `Dashboard.tsx`. The figure, filter, arrange, set, and spotlight behaviors should be separate components with explicit props and state boundaries.

---

# 19. Core UI states to design in Figma

Create these exact frames first.

### Public

- `P01 · Chapter / Default`
- `P02 · Chapter / Filters open`
- `P03 · Chapter / Active filters`
- `P04 · Chapter / Arrange mode`
- `P05 · Chapter / Drag in progress`
- `P06 · Figure / Spotlight`

### Personal sets

- `S01 · My Sets / Index`
- `S02 · Set / Default`
- `S03 · Set / Spotlight figure`
- `S04 · Set / Arrange mode`
- `S05 · Set / Add figures`
- `S06 · Set / Update preferences`

### Auth

- `A01 · Login / Entry`
- `A02 · Login / Demo identity`
- `A03 · Login / Waiting`
- `A04 · Login / Success`

### Mobile

- `M01 · Chapter / Default`
- `M02 · Chapter / Filters sheet`
- `M03 · Figure / Spotlight`
- `M04 · Set / Default`
- `M05 · Set / Arrange mode`

---

# 20. Mobile behavior

## Public chapter

- no persistent chapter rail
- one figure per row
- chapter selector under top nav
- figure plot height ~210–240 px
- figure actions remain touch-accessible

## Filters

Open as a full-width sheet.

Footer actions remain visible at bottom of sheet if possible.

## Arrange

- one-column sortable list
- drag handle on left/top
- vertical insertion indicator
- also expose Move up / Move down actions

## Spotlight

- chart full width
- controls move below chart in stacked sections
- no side panel
- legend wraps

---

# 21. Accessibility requirements

Minimum expectations:

- all interactive targets approximately 44×44 px on touch
- visible keyboard focus
- semantic buttons, inputs, checkboxes, labels
- charts must have accessible title/description text
- chart information must not depend on color alone
- tooltip values should also be available via keyboard/accessible table or summary where practical
- drag-and-drop must have a keyboard/non-drag alternative
- color contrast should meet WCAG AA for text and controls
- respect `prefers-reduced-motion`

---

# 22. Motion

Use motion sparingly.

Recommended:

- drawer open/close: 180–220 ms
- figure reorder movement: 160–220 ms
- spotlight transition: 180–240 ms
- hover/focus color changes: 100–150 ms

Avoid:

- bouncing
- spring-heavy motion
- chart entrance animations on every page load
- animated number counters

The product should feel calm and deliberate.

---

# 23. Prototype flows to wire in Figma

## Flow A — browse → filter → spotlight

```text
Public chapter
→ Síur og leit
→ choose filters
→ Sýna N myndir
→ open figure spotlight
→ change time range
→ return to chapter
```

## Flow B — browse → save → personal set

```text
Public figure
→ ☆
→ choose/create set
→ confirmation
→ Mín söfn
→ open set
```

## Flow C — set → arrange

```text
Set detail
→ Raða myndum
→ drag figure
→ save order
→ normal set view
```

## Flow D — demo login

```text
Login
→ demo identity
→ waiting
→ success
→ My Sets
```

## Flow E — email updates demo

```text
Set detail
→ Uppfærslur
→ enable
→ choose digest frequency
→ save
→ demo confirmation
```

---

# 24. Frontend implementation hints

Recommended stack:

```text
React
TypeScript
Vite
Apache ECharts
@dnd-kit/core + @dnd-kit/sortable
React Router or a lightweight router
CSS Modules / vanilla CSS / Tailwind (choose one; do not mix systems casually)
```

For GitHub Pages, ensure the base path is configurable.

Example Vite env concept:

```ts
base: import.meta.env.BASE_URL
```

If normal history routing causes GitHub Pages deep-link issues, use hash routing for the demo or add a static SPA fallback.

---

# 25. Data model expectations

A figure definition should be configuration-driven rather than hard-coded into the component.

```ts
export interface FigureDefinition {
  id: string;                 // "I-1"
  chapterId: string;          // "I"
  title: string;
  subtitle?: string;
  unit?: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  chartType: "line" | "bar" | "area" | "scatter";
  sources: string[];
  note?: string;
  tags?: string[];
  series: FigureSeries[];
}
```

Personal set:

```ts
export interface FigureSet {
  id: string;
  name: string;
  figureIds: string[];        // order is significant
  spotlightFigureId?: string;
  updatedAt: string;
}
```

Demo notification preferences:

```ts
export interface NotificationPreference {
  setId?: string;
  figureIds?: string[];
  frequency: "immediate" | "daily" | "weekly";
  email: string;
  enabled: boolean;
}
```

---

# 26. Suggested Figma component variants

## Button

Variants:

- Primary
- Secondary
- Ghost
- Text
- Danger text

States:

- Default
- Hover
- Focus
- Pressed
- Disabled

## FigurePanel

Variants:

- Public / Default
- Public / Hover
- Arrange / Default
- Arrange / Dragging placeholder
- Set / Default
- Set / Spotlight span
- Loading
- No data

## FilterControl

Variants:

- Checkbox row
- Segmented period preset
- Select
- Date input
- Search input

## Drawer

Variants:

- Filters
- Add figures
- Notifications

## SetCard

Variants:

- Default
- Hover
- Empty/new

---

# 27. Acceptance criteria for the visual implementation

The implementation is visually successful if all of the following are true:

1. On first load, attention goes to charts rather than controls.
2. The page feels related to an editorial/statistical publication, not a BI dashboard.
3. The public view has clear chapter identity and figure numbering.
4. Personal sets are noticeably lighter than public chapter pages.
5. Filters are powerful but mostly hidden until requested.
6. Reordering is explicit, understandable, and reversible.
7. Spotlight genuinely gives one figure visual priority.
8. The interface works without shadows as a primary organizing device.
9. Figure metadata and sources remain readable without overwhelming the chart.
10. Mobile is a deliberate one-column experience, not a squashed desktop layout.
11. Demo authentication and email settings clearly communicate that they are simulated.
12. A developer can implement the interface from components and tokens rather than reproducing screenshots pixel-by-pixel.

---

# 28. First implementation milestone

Build only these screens first:

```text
1. Public chapter — default
2. Filters drawer — open + active state
3. Arrange mode — including drag in progress
4. Figure spotlight
5. Personal set — default
6. Personal set — arrange mode
```

Use 6–8 mock figures with realistic Icelandic titles and time-series shapes.

Do not build login or email flows until these six states feel visually correct.

---

# 29. Copy/paste prompt for Codex

Use this after both design documents are present in the repository:

```text
Read `hagvisar_design_spec.md` and `hagvisar_figma_spec.md` in full before writing code.
Treat them as the source of truth for the UI.

Implement the first Hagvísar frontend milestone as a React + TypeScript + Vite app.
Use Apache ECharts for charts and dnd-kit for sortable drag-and-drop.

Build these states first:
1. Public chapter default view
2. Expanded Síur og leit drawer
3. Active filters state
4. Raða myndum mode
5. Visible drag-in-progress state
6. Figure spotlight view
7. Personal set default view
8. Personal set arrange mode

Use mock JSON data and localStorage only. There is no backend yet.

Important visual constraints:
- white-first, Nordic-minimalist, editorial
- charts are the visual focus
- use Roman-numeral chapter identity and figure IDs
- public view has chapter context; personal sets have much less editorial scaffolding
- no generic BI-dashboard look
- no heavy shadows, gradients, KPI tiles, or large colored surfaces
- filters are hidden in a right-side drawer until requested
- figures reorder only in explicit arrange mode
- drag-and-drop is a sortable grid, not freeform positioning
- spotlight gives one figure most of the available page width
- responsive mobile behavior must be implemented
- accessibility and keyboard alternatives for drag-and-drop are required

Keep the component structure close to the component inventory in `hagvisar_figma_spec.md`.
Do not collapse everything into one page component.

Before coding, briefly state the component architecture and implementation plan. Then implement it.
```

---

# 30. Design decisions that should remain open for the first visual pass

Do not over-specify these until the six milestone screens are reviewed:

- exact chart-series colors
- whether default figure panels have a 1 px border or rely entirely on whitespace
- whether figure titles use serif or UI type
- exact density of source/method notes in personal sets
- whether the filter drawer docks on ultra-wide monitors
- whether spotlight is implemented as a dedicated route or full-width in-page state

Everything else in this document should be treated as intentional unless changed during review.

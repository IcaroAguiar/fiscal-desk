# Fiscal Desk V5-A Visual Spec

This spec is the source of truth for implementation. It is compiled from the approved V5-A desktop and mobile references. It is not a creative direction document.

## Product Contract

Fiscal Desk remains an Electron cockpit for local CSV consultation. The redesign must preserve CSV selection, provider configuration, local base preparation/notice, processing, cancellation, output export, history, provider state, progress, and execution feedback. The visual layer may normalize long or technical state into stable display slots, but it must not fake core behavior.

## Visual Intent

The screen is a quiet operational cockpit: cardless, borderless, dense enough for work, but open and calm. Surfaces are not closed boxes. Content is separated by single subtle lines, alignment, whitespace, and status dots. The design must not look like a generic admin dashboard, a landing page, or a stack of cards.

## Desktop Structure

- Canvas: 1440x960 reference.
- Background: warm off-white.
- Window chrome: 39px high full-width band with three small dots at x 20/38/56, centered label `A · COCKPIT BORDERLESS`, right label `LINES ONLY`.
- Sidebar: fixed left column, about 223px wide, warm slightly darker surface, only a right divider and internal horizontal footer separator.
- Main area starts at x about 223.
- Topbar: 66px high, horizontal bottom divider.
- Main work area: starts around y 105, left inset about 19px from content edge, right queue column starts near x 1105.
- Desktop main layout has three conceptual bands:
  - Top work band: entry + configuration + queue.
  - Middle band: KPI strip + history.
  - Bottom band: log + output.

## Mobile Structure

- Canvas: 390px wide reference.
- Window chrome stays at top.
- No desktop sidebar block at the top. Mobile starts with `Operação fiscal`, tabs, statuses, and CTA.
- Content is one column, preserving the same order:
  1. Header/tabs/status/CTA
  2. Entrada
  3. Configuração
  4. Fila
  5. KPI grid 2x2
  6. Últimas execuções
  7. Log
  8. Saída
- Mobile horizontal padding: about 10px.
- Mobile first viewport must not be consumed by navigation/sidebar.

## Borderless Rules

- No card formation: avoid closed rectangles around repeated modules.
- No borders that meet on all four sides to form cards, except tiny CSV glyph and buttons.
- Dividers may be horizontal or vertical, but must read as open structural lines.
- Avoid rounded corners. Default radius is 0 or 2px.
- Avoid filled badges. Status uses text + small dot. Outline only when required by a button/control.
- Active sidebar item uses a slim vertical indicator, no filled active background.
- Hover can use subtle underline/glow/indicator, not filled blocks.

## Typography

- Font: system sans/inter-compatible.
- H1: bold, compact, about 24px desktop and mobile.
- H2: about 18px, bold.
- Body: 13px to 14px, warm gray.
- Labels: uppercase, 11px, bold, letter spacing about 0.14em.
- KPI numbers: bold, about 25px desktop/mobile.
- Log: monospace, about 12px, short timestamp lines.

## Colors

- Base: warm off-white near `#f7f5ef`.
- Sidebar: slightly darker warm surface near `#eee9df`.
- Text: near `#24221e`.
- Muted text: warm gray near `#6f6a60`.
- Divider: low contrast warm line near rgba(70, 62, 50, 0.16).
- Primary dark green: near `#183823`.
- Success dot/text: green.
- Warning dot/text: amber.
- Error dot/text: red.
- Info dot/text: muted blue.

## Required Desktop Landmarks

- Window chrome.
- Sidebar with brand, nav, active indicator, footer status.
- Topbar with title, tabs, two provider statuses, primary CTA.
- Entrada area with status dot, CSV glyph, title, helper text, primary select button.
- Configuração key/value list with provider, coluna, saída, checkpoint.
- Fila with three rows and one active left indicator.
- KPI strip with four equal open cells.
- Últimas execuções with table header and three rows.
- Log with four timestamp lines.
- Saída with status dot, short explanatory text, Pasta and Exportar buttons.

## Required Mobile Landmarks

- Window chrome.
- Header/topbar without sidebar.
- Same tabs/statuses/CTA as desktop.
- Entrada block, Configuração key/value list, Fila, KPI 2x2, history rows, log, output.
- No desktop nav before the operation title.

## Reference Fixture State

The visual fixture must render this deterministic state:

- Provider status: `mock ativo`.
- Secondary status: `Receita Web assistida`.
- File status: `aguardando arquivo`.
- Entrada title: `Arquivo de CNPJs`.
- Queue count: `3 itens`.
- Queue rows:
  - `clientes-maio.csv`, `1 linha pendente`, status `revisão`.
  - `base-fornecedores.csv`, `246 linhas processadas`, status `concluído`.
  - `entrada-manual.csv`, `2 CNPJs inválidos`, status `erro`.
- KPIs:
  - Hoje: `8`, `execuções`.
  - Processados: `1.284`, `CNPJs`.
  - Pendentes: `3`, `linhas`.
  - Erros: `2`, `revisar`.
- History rows:
  - clientes-maio.csv, revisão, 5, mock, pendente.
  - base-fornecedores.csv, concluído, 246, mock, baixado.
  - entrada-manual.csv, erro, 18, mock, bloqueado.
- Log:
  - `10:41:12 base local carregada`
  - `10:41:16 aguardando arquivo de entrada`
  - `10:41:19 provider mock disponível`
  - `10:41:23 receita-web em modo assistido`
- Output text: `Arquivo processado disponível após a execução.`
- Output format: `csv`.

## Production State Adaptation

Real runtime state must map into stable slots:

- Long filenames are truncated visually and must not change layout geometry.
- Technical ledger paths, run ids, checkpoint paths, and resume counts do not appear in the default cockpit log.
- Detailed technical data can remain in accessible state or future details, but not in the primary V5-A screen.
- Empty state may show real empty content, but it must keep the same shell geometry and not introduce card-like blocks.
- Mobile must keep the same order and avoid navigation-first layout.

## Forbidden Omissions

- Do not remove functional controls to improve pixels.
- Do not remove provider/local base behavior.
- Do not remove accessible labels.
- Do not change core provider adapters.
- Do not use current actual screenshots as goldens.

# Mr. Sullivan's Classes — Site Style Guide
*Reference for `SullyTheElder/2026-27` (GitHub Pages) and any web-based lesson
tools, games, or worksheets built for it.*

This guide documents the visual system already in use across IT Fundamentals
slide decks, exit tickets, and interactive HTML tools (e.g. Network Relay),
so a consistent look can be applied at the site/stylesheet level across all
classes hosted on the repo (`it-foundations`, `ap-networking`,
`ap-cybersecurity`, `esports`).

It pairs with `styles.css` — a drop-in stylesheet implementing every token
and pattern below as CSS custom properties and base classes.

---

## 1. Brand palette

Derived from the existing IT Fundamentals banner and slide deck system.
Named tokens, not raw hex, should be used in code wherever possible.

| Token             | Hex       | Role                                                        |
|--------------------|-----------|--------------------------------------------------------------|
| `--navy-deep`       | `#0B1830` | Primary background (dividers, hero sections, dark panels)   |
| `--navy`            | `#132340` | Secondary background / card surfaces on dark layouts        |
| `--navy-light`      | `#1D3358` | Borders, subtle panel separation on dark backgrounds        |
| `--teal`            | `#1FA98F` | Primary accent — buttons, links, active states               |
| `--mint`            | `#5EEAD4` | Secondary accent — highlights, success states, hover glow    |
| `--coral`           | `#EF5B5B` | Attention accent — alerts, "you are here" markers, key nodes |
| `--amber`           | `#F5A623` | Warning / caution accent — reroutes, changed conditions      |
| `--white`           | `#FFFFFF` | Text on dark backgrounds, primary UI chrome                 |
| `--ink`             | `#12202F` | Body text on light backgrounds                               |
| `--paper`           | `#F7F9FB` | Light background for worksheets / printable-style content    |
| `--muted`           | `#7C8BA3` | Secondary/caption text, disabled states                      |

**Usage notes**
- Navy is the dominant surface color for dividers, headers, and any
  "official course" framing (title slides, unit dividers, site chrome).
- Teal/mint are the everyday interactive accent pair — default buttons,
  links, correct/valid states, progress indicators.
- Coral is reserved for emphasis: the current node/position in a game,
  errors, required attention. Don't use it decoratively.
- Amber is reserved for *changed conditions* — a rerouted path, a modified
  map, a caution note. It should read as "something shifted, look again,"
  distinct from coral's "this is wrong/critical."
- On light/paper backgrounds (worksheets, printables), keep the accent
  colors but darken opacity or use them only for icons/borders, not large
  fill areas, to preserve print contrast.

---

## 2. Typography

| Role          | Typeface                         | Fallback stack                                              |
|----------------|-----------------------------------|----------------------------------------------------------------|
| Display / headings | Cambria                     | `"Cambria", Georgia, "Times New Roman", serif`                 |
| Body / UI text     | Calibri                     | `"Calibri", "Segoe UI", Helvetica, Arial, sans-serif`           |
| Code / data (if needed) | system monospace       | `"Consolas", "SFMono-Regular", Menlo, monospace`                |

- Cambria is used for titles, unit headers, and slide dividers — it's the
  "this is instructional/official" voice.
- Calibri carries everything else: body copy, buttons, labels, game UI,
  worksheet instructions.
- Both are pre-installed on Chromebooks/ChromeOS via the standard font set
  used in Google Workspace, so no webfont loading is required for the
  primary faces — fallback stacks exist only for edge cases (PDF export
  tools, non-Chrome preview, etc.).
- Type scale (rem, base 16px):

  | Use                  | Size   | Weight |
  |------------------------|--------|--------|
  | Unit / page title (H1) | 2.25rem | 700   |
  | Section heading (H2)   | 1.5rem  | 700   |
  | Subheading (H3)        | 1.125rem| 600   |
  | Body                   | 1rem    | 400   |
  | Caption / meta         | 0.85rem | 400   |
  | Button / label         | 0.95rem | 600   |

---

## 3. Bilingual (EN/ES) formatting — standing convention

Every exit ticket, and any interactive tool with instructional text, follows
the same bilingual pattern:

- English text first, normal weight.
- Spanish translation immediately below, *italicized*, same size or one
  step smaller, in `--muted` or body color at reduced opacity — visually
  "attached" to its English line, not a separate section.
- Translations are meaning-based for a conversational HS Spanish speaker,
  not literal/formal translations.

```html
<p class="bilingual">
  <span class="en">Choose the safest path to the server.</span>
  <span class="es">Elige la ruta más segura al servidor.</span>
</p>
```

Slide decks are produced as full parallel EN and ES versions (two decks),
rather than bilingual text on the same slide — reserve the inline
`.bilingual` pattern above for exit tickets, worksheets, and in-tool UI text.

---

## 4. Core components

**Dividers / section breaks**
Full-bleed `--navy-deep` background, white Cambria heading, optional thin
`--teal` underline rule beneath the unit number or title (see banner
reference — teal underline beneath "IT" in the wordmark).

**Buttons**
- Primary: `--teal` fill, white text, subtle `--mint` glow/lift on hover.
- Secondary: transparent/outline, `--navy-light` border, `--navy` text on
  light backgrounds or white text on dark.
- Disabled/inactive: `--muted`, no hover state.
- Minimum touch target 44×44px — Chromebook trackpad + touch-hybrid
  devices in class.

**Cards / panels**
Rounded corners (8–10px), `--navy` or `--paper` surface depending on
context, `--navy-light` or light gray 1px border, no heavy drop shadows —
flat elevation with border definition instead.

**Nodes / markers (game & diagram UI)**
Circular markers with radial gradient fill using the palette (teal→mint for
neutral/available nodes, coral for current position or critical node, amber
for changed/warning state) — matches the existing banner icon treatment and
the Network Relay map style.

**Status/feedback states**
- Success / valid path: `--mint` on `--navy` or `--teal` text on light.
- Warning / changed condition: `--amber`.
- Error / invalid / blocked: `--coral`.
- Never rely on color alone — pair with an icon or text label for
  colorblind accessibility.

---

## 5. Layout & spacing

- Base spacing unit: 8px. Use multiples (8/16/24/32/48) for padding and
  gaps rather than arbitrary values.
- Max content width for readable text blocks: ~720px.
- Interactive tools (games, simulations) can use full viewport width but
  should keep primary controls within a comfortable single-hand/trackpad
  reach zone — most of these are used on 11–13" Chromebook screens.
- Mobile/narrow support isn't a priority (Chromebook-only in class) but
  tools shouldn't visibly break under ~1024px width in case of projector
  or alternate display use.

---

## 6. Accessibility floor

- Text contrast: minimum 4.5:1 for body text against its background at all
  times — verify new color pairings, don't assume.
- Visible keyboard focus states on every interactive element (many
  students navigate via trackpad/keyboard on shared devices).
- Don't encode meaning in color alone (see status states above).
- Respect `prefers-reduced-motion` for any animated transitions.

---

## 7. Notes for the site-level stylesheet build

- This system should become the shared chrome (nav, headers, footers,
  index/listing pages) across **all** class sites in the repo — IT
  Foundations, AP Networking, AP Cybersecurity, Esports — not just IT
  Fundamentals. Individual tools can still have their own accent moments,
  but should inherit base typography, palette, and spacing from the shared
  sheet.
- Per `SITE_CONVENTIONS.md`, all tools remain single self-contained HTML
  files with inline CSS/JS — so the site-level stylesheet's main jobs are:
  (1) the auto-generated index/listing pages and site chrome, and (2) a
  reference `styles.css` that individual tool authors can copy variables
  and patterns from, since tools can't currently `<link>` an external
  shared stylesheet without breaking the "self-contained file" rule.
- If external linking ever becomes viable (e.g. all tools guaranteed to
  load from the same domain), revisit consolidating into one linked
  stylesheet instead of copy-in variables.

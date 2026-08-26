# Mr. Sullivan's Classes — Web Tools Style Guide

Companion to `SITE_CONVENTIONS.md`. That file governs *where files go and
how the site builds*; this one governs *what individual lesson tools look
like*. Pair the two when briefing anyone (human or AI) on a new tool.

**Scope:** interactive HTML tools/simulators built for class use
(`whatwasithinking.us/<class-slug>/class_lessons/...`) — not the portal
pages. The portal/chrome pages (index, class listing) are a *separate*
system: `assets/site.css` + `assets/themes/<class>.css`. Don't confuse
the two — this doc and `assets/tools.css` are tool-scoped only.

**Status:** this is the reconciled, canonical version — merged from
independently-drafted proposals across multiple class-specific project
chats (AP Networking's and AP Cybersecurity's, initially). If a class
project chat has its own older copy of a style guide or `site.css`
draft, that copy is superseded by this file; see the per-project sync
notes for what specifically changed.

The audience throughout: 15–18 year old students on district
Chromebooks, often in short (40-min) lab periods. Every decision below
is filtered through that — fast to load, legible on a small
low-contrast screen, no dependency on precision mouse input, nothing
that reads as decoration for its own sake.

---

## 1. System, not four skins

One shared visual language runs under all four classes so the site
feels like a single, deliberate place — not four unrelated exports.
Each class gets its own **accent colors + heading font** layered on a
common **base**, switched with one attribute:

```html
<html lang="en" data-course="ap-networking">
```

Values match the folder slugs exactly: `it-foundations`,
`ap-networking`, `ap-cybersecurity`, `esports`.

`assets/tools.css` reads that attribute and swaps `--accent`,
`--accent-2`, and `--font-display`. Everything else — body font, mono
font, spacing, components, focus ring — is **fixed across all classes
on purpose**. A student moving between an AP Networking tool and an AP
Cybersecurity tool in the same period shouldn't have to relearn what a
button or a warning callout looks like; only the accent color and
heading typeface should signal "which class am I in."

```html
<link rel="stylesheet" href="/assets/tools.css">
```

A tool can skip this entirely and stay fully self-contained/hand-styled
if that's simpler for a one-off — this is optional infrastructure, not
a requirement.

---

## 2. Color system

### Shared/neutral tokens (identical across every class)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F1E9` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels, table/form surfaces |
| `--ink` | `#1C1B19` | Body text |
| `--ink-muted` | `#5B584F` | Secondary text, captions |
| `--line` / `--line-strong` | `#DAD5C7` / `#B9B39F` | Borders, dividers, table rules |
| `--focus` | `#D9A441` | Keyboard-focus ring — **fixed, not themed**. Same signal everywhere. |
| `--success` / `--warning` / `--danger` | `#3F7D4F` / `#B8862E` / `#A23B32` | Feedback states (pass/caution/fail) |

### Per-class accent pairs

| Class | `--accent` | `--accent-2` | Status |
|---|---|---|---|
| AP Networking | `#0B1F3A` navy | `#8FC53E` green | **Confirmed** — Bulldog Networking brand |
| AP Cybersecurity | `#1B4332` forest green | `#D4A017` gold | **Confirmed** — from the Bulldog Cybersecurity logo (also has `--accent-dark: #0F2A1F` and `--olive: #8DA13E`, both scoped to that class's own components — see §5) |
| IT Foundations | `#1FA98F` teal | `#5EEAD4` mint | **Confirmed** — matches `it-foundations/STYLE_GUIDE.md`'s established brand, already in production use in that class's slide decks and tools |
| Esports | `#6E2594` violet | `#1FB6C9` cyan | **Placeholder — unconfirmed.** No real branding exists for this section yet; don't treat these as final. |

**Contrast note carried over from Cybersecurity's original draft:** gold
(`#D4A017`) on white is not AA-safe for small body text (~2.3:1) — fine
for large text (18px+/bold), icons, borders, and badges, never for
body copy. Forest green and navy both clear AA at all sizes.

---

## 3. Typography

- **Body** — `Inter`, shared across all classes. Chosen for screen
  legibility over character; students need to actually read this, in
  every class, for the whole tool to work.
- **Mono** — system stack (`ui-monospace`, `SFMono-Regular`, `Menlo`,
  `Consolas`...), shared. No web font — Chromebooks render monospace
  fine natively, and this keeps load fast. Used for IPs, CLI output,
  binary/hex, MAC addresses, log excerpts — load-bearing for
  scannability, not decoration.
- **Display/heading** — the one place typography carries class
  identity:
  - AP Networking, IT Foundations, Esports (placeholder): `Space
    Grotesk`
  - AP Cybersecurity: `Source Serif 4` — matches that class's existing
    print brand (Cambria in print; Cambria itself isn't loaded on the
    web since it's not a ChromeOS-available font and licensing a
    Microsoft font as a web font isn't viable — Source Serif 4 is a
    free, metrically-similar substitute that keeps the same visual
    register without the licensing/availability problem)

### Type scale (rem, 16px base)

| Role | Size | Weight |
|---|---|---|
| H1 | 2rem | 700 |
| H2 | 1.5rem | 700 |
| H3 | 1.15rem | 600 |
| Body | 1rem | 400 |
| Small / caption | 0.85rem | 400–500 |
| Data/mono | 0.9rem | 400–600 |

Don't go smaller than 0.85rem anywhere a student has to read it.

---

## 4. Layout & spacing

4px base unit: `4, 8, 12, 16, 24, 32, 48`. Panels/cards get
`16–24px` internal padding; sections stack with `32–48px` between
them. No fixed pixel container widths — needs to work from a
1366×768 Chromebook up to a projector.

---

## 5. Signature motifs — kept distinct per class, not merged

Two classes have real, logo-derived signature elements. These are
**intentionally not unified into one shared motif** — forcing that
would undermine the actual goal (each class reads as itself, not a
reskinned template):

- **AP Networking — `.trace`**: a thin corner-bracket accent (top-left
  in `--accent`, bottom-right in `--accent-2`) on a panel. Use once per
  panel, not once per element.
- **AP Cybersecurity — `.circuit-rule`**: a PCB-style horizontal rule
  with a right-angle jog, pulled directly from the Bulldog
  Cybersecurity logo's circuit-line work. Requires a small inline SVG
  in the tool's HTML (see `assets/tools.css` comments for the shape);
  the CSS just colors it via `--olive`. Keep `--olive` scoped to this
  motif only — if it starts appearing in buttons or body text, it
  stops reading as a signature and becomes a third competing color.
- **IT Foundations / Esports**: no signature motif defined yet.

---

## 6. Components (see `assets/tools.css` for implementation)

- **`.site-nav`** — solid `--accent` background nav bar, active-link
  underline in `--accent-2`.
- **`.panel` / `.card`** — aliases for the same base container (two
  different class projects independently reached for different names
  for the same thing; both work identically now).
- **`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost`** —
  44×44px minimum hit target, focus ring always visible.
- **`.badge`** (solid label) and **`.eyebrow`** (uppercase pill with a
  dot marker) — two different label styles, kept as distinct options
  rather than forced into one.
- **`.callout` / `.callout-success` / `.callout-warning` /
  `.callout-danger`** — plain `.callout` uses the shared gold/focus
  tone as a neutral default; modifiers add semantic color.
- **`.data`, `code`, `pre`** — monospace, for IPs/CLI/log content.
- **Bare `table`/`th`/`td`** — styled directly, no wrapper class
  required; add `.mono` to a cell for monospace data columns.
- **Form controls** — inputs/selects/checkboxes/radios share one focus
  and error treatment.

---

## 7. Accessibility & performance floor (non-negotiable)

- WCAG AA contrast minimum for all text (see the gold caveat in §2).
- `:focus-visible` always shows the `--focus` ring — never `outline:
  none` without a replacement.
- Respect `prefers-reduced-motion`; no motion is load-bearing for
  understanding a tool.
- No layout depends on hover alone — Chromebooks are frequently
  touch-enabled.
- Test on an actual Chromebook in Chrome before calling any tool done.

---

## 8. Open decisions

1. **Esports** has no confirmed branding (colors, motif, or otherwise)
   — revisit once that section has real content/team identity rather
   than inheriting placeholder values by default.
2. Whether **IT Foundations' or Esports' tools** ever get their own
   signature motif (matching Networking's and Cybersecurity's pattern)
   is open — not required, just currently absent.

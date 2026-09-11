# Class Resources Site — Project Briefing

Read this fully before making changes. This repo has a fair amount of
accumulated convention and a couple of hard-won gotchas — skipping this
will likely reproduce bugs that have already been fixed once.

## What this is

A static site hosting interactive HTML/JS lesson tools for four high
school CTE classes, built and maintained by Mr. Sullivan (Sully).
Students access it directly in-browser — no accounts, no server code,
no student data collected.

- **Repo:** `SullyTheElder/2026-27`
- **Live URL:** `https://whatwasithinking.us/` (custom domain, DNS
  pointed at GitHub Pages — NOT the raw `sullytheelder.github.io` URL,
  though that still resolves to the same content)
- **Hosting:** GitHub Pages, built via GitHub Actions on every push
  (Pages Source is set to "GitHub Actions", not "Deploy from a branch")
- **Why the custom domain exists:** the school's network content filter
  blocks `*.github.io` outright; the custom domain routes around that.

Classes (fixed folder slugs, don't rename): `it-foundations`,
`ap-networking`, `ap-cybersecurity`, `esports`.

Full conventions: `SITE_CONVENTIONS.md` (repo root). Full tool-styling
system + rationale: `assets/TOOLS_STYLE_GUIDE.md`. Read both before
building anything new — this file is a summary, not a replacement.

## Build system

`scripts/build.py`, run automatically by `.github/workflows/deploy.yml`
on every push to `main`. No manual build step, ever.

What it does:
1. Copies the whole repo into `_site/` (excluding `.git`, `.github`,
   `scripts`, `_template.html` files, `README.md`).
2. For every `class_lessons/_template.html`, scans that folder for
   lesson `.html` files, auto-generates the lesson list, and writes the
   real `index.html` into `_site/`.
3. Injects a disclaimer footer into every portal/chrome page (never
   into individual lesson/tool files).

**Never hand-edit a `class_lessons/index.html`** — it doesn't exist in
the repo at all; it's a build output. The file you edit is
`class_lessons/_template.html`.

**Unit/title naming is automatic:** a lesson at
`class_lessons/unit3/subnetting-practice.html` becomes "Unit 3" /
"Subnetting Practice" with zero manual labeling. Files placed directly
in `class_lessons/` (no subfolder) group under "Lessons".

## Adding a new lesson/tool

1. Drop the file at `<class-slug>/class_lessons/<unit-slug>/<file>.html`
2. Commit/push. That's it — the listing updates itself.
3. **Every tool must either open in a new tab/window when linked, or
   include in-page navigation back to the main site.** This is a
   standing requirement, not optional per-tool.
4. Tools stay single self-contained `.html` files (inline CSS/JS) or a
   small set of files referenced by relative path — no build step, no
   npm install, no server code. External CDN resources fetched live by
   the browser are fine.

## Styling — two layers, don't conflate them

**Portal/chrome pages** (index + listing pages, auto-generated or
hand-authored) use `assets/site.css` (shared skeleton, all colors via
CSS variables) + `assets/themes/<class>.css` (sets those variables per
class). Esports is the one exception — it doesn't use this system at
all; see below.

**Individual lesson tools** can optionally link `assets/tools.css`,
themed via `<html data-course="ap-networking">` (values match folder
slugs exactly). This is opt-in — a tool can also be fully hand-styled
and skip this entirely. IT Foundations also has its own richer,
bespoke reference library (`it-foundations/styles-reference.css` +
`it-foundations/STYLE_GUIDE.md`) for tools in that class specifically,
separate from the cross-class `assets/tools.css` system.

**Esports is architecturally its own thing.** `esports/style.css` is a
fully bespoke stylesheet (halftone texture, chevron accent, condensed
jersey typography) — it does NOT use `assets/site.css` or
`assets/tools.css`. Don't try to fold it into the shared system;
that's intentional, not an oversight.

### Per-class brand status (confirmed vs. placeholder)

| Class | Colors | Status |
|---|---|---|
| AP Networking | `#0B1F3A` navy / `#8FC53E` green | Confirmed |
| AP Cybersecurity | `#1B4332` forest green / `#D4A017` gold | Confirmed |
| IT Foundations | `#1FA98F` teal / `#5EEAD4` mint | Confirmed |
| Esports | own bespoke system (green/gold/orange, see `esports/style.css`) | Confirmed |

Root/neutral pages use Le Grand HS's actual school colors (Kelly
Green/Gold, best-guess hex pending an official swatch — see
`assets/themes/neutral.css` comments).

## Known gotchas (already hit, already fixed once)

- **Browser drag-and-drop silently drops hidden dotfolders/files.**
  `.github/workflows/deploy.yml` and stray nested folders have been
  lost this way before. Not a concern for Claude Code working via git
  directly, but worth knowing why some file-existence checks exist.
- **A stray leftover `index.html` in a `class_lessons/` folder gets
  listed as a fake lesson named "Index".** Already fixed via
  `LESSON_SCAN_EXCLUDE_FILES` in `build.py` (scoped separately from the
  `copy_tree()` exclusion, which still needs to copy real
  `index.html` landing pages) — don't reintroduce a shared exclusion
  set that would break both at once.
- **Two nearly-identical `_template.html` files across classes have
  been mixed up via copy-paste before** (wrong class's title/breadcrumb
  showing on another class's page). If editing these, double check the
  `<title>` and `.crumb` text match the actual folder.

## Open items, not yet resolved

- Esports' accent-color confirmation is done, but no signature motif
  parity check has been done against Networking's `.trace` / Cyber's
  `.circuit-rule` pattern.
- `assets/tools.css` isn't linked from any real tool file yet
  (`topology_explorer.html` predates it) — retrofitting is optional,
  not required.
- No tool has yet been built against IT Foundations' bespoke reference
  library either — same status, optional.
- Self-hosted server / VPS decision for anything needing real hands-on
  system access (packet capture, SSH, etc.) is explicitly out of scope
  for this static repo — flag it rather than faking it with a browser
  simulation, per `SITE_CONVENTIONS.md`.

## Working style Sully prefers

- Route changes through review before pushing when they're multi-file
  or touch shared infrastructure (build script, shared CSS); small
  single-line text edits are fine to just make directly.
- Confirm, don't assume, on anything with more than one reasonable
  interpretation — several past rounds of back-and-forth were avoided
  simply by asking first.
- Any created materials should refer to the teacher as "Mr. Sullivan,"
  even though he's addressed as "Sully" in conversation.

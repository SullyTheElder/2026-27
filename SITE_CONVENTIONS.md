# Class Resources Site — Conventions Reference

Paste or upload this file into any new chat/project where you're building a
tool for one of these classes, so whoever's helping (Claude or otherwise)
knows how it needs to slot in.

## The platform

- **Repo:** `SullyTheElder/2026-27` (GitHub Pages)
- **Live base URL:** `https://whatwasithinking.us/` (custom domain
  mapped onto the same GitHub Pages repo — not the raw
  `sullytheelder.github.io` URL)
- **Hosting:** fully static — HTML/CSS/JS only, no server-side code, no
  build tools required beyond what's already set up (GitHub Actions
  handles the build automatically on every push).
- **Structure:** each class gets its own subdirectory off the base
  URL (e.g. `.../it-foundations/`, `.../ap-cybersecurity/`) — see the
  table below for the fixed slugs.

## What this site is for (and what it isn't)

This repo is a **static, client-side-only** resource. That makes it the
right home for:

- Interactive diagrams, visualizations, and walkthroughs
- Self-checking practice tools (quizzes, drag-and-drop, "spot the red
  flag" style exercises)
- Reference tools (calculators, decoders, lookup tables)
- Lightweight simulations where all the logic can run in the browser
  (e.g. a simulated log viewer, a fake phishing-email inspector, a
  password-strength visualizer)

It is **not** a substitute for real hands-on lab infrastructure. Anything
that needs a real terminal, a real network stack, persistent per-student
state on a server, or an actual OS to interact with (packet capture
tools, a Kali VM, SSH into a box, CyberRange-style environments) still
depends on the separate self-hosted server / cloud VPS decision that's
still open. Don't let a clever static "simulation" quietly become the
answer to that problem — if a lesson calls for genuine hands-on system
access, flag it as needing that infrastructure rather than working
around it with a fake browser version that teaches the wrong instincts.

Chromebook/browser compatibility is non-negotiable for anything built
here — students have no other device. Test in a Chromebook-equivalent
(Chrome, no local install, no extensions assumed) before considering
something done.

## When it's worth building a custom tool here

Building something new costs time. Before starting, it should clear at
least one of these bars:

- **No existing resource does it well.** Checked Cyber.org and the
  College Board materials first and neither has a lesson/activity that
  hits the LO at the right depth.
- **The concept is genuinely spatial/dynamic** and a static
  slide/handout can't show it as well as something interactive can
  (e.g. watching a credential-stuffing attempt play out beats reading
  about one).
- **It enables real transfer practice** — a self-checking exercise
  with a new scenario each time, not just a repackaged worksheet.

If none of these apply, it's probably faster and just as effective to
build the usual deck/handout/exit-ticket set instead of a custom tool.

## Improving an existing tool means making it *less* generic

The goal here isn't to build polished, general-audience tools other
teachers could drop into any classroom. It's the opposite: when an
existing tool (Cyber.org, College Board, some open-source demo, etc.)
is close but not quite right, "improving" it usually means stripping
out the parts that only exist to serve a broad audience and replacing
them with things specific to this course:

- Swap generic/placeholder scenarios for the same composite-character
  style used elsewhere in the course (see lesson-set conventions in
  the class's own materials) so it reads as part of the same world
  students already know.
- Cut settings, difficulty tiers, or branches that exist to cover
  audiences this course doesn't have (e.g. a college-level or
  professional-track mode).
- Wire it directly to the specific LO(s) it's supporting instead of
  the broader topic the original tool covers, and drop anything that
  doesn't serve that LO.
- Match it to this course's brand system and reading level rather than
  the original tool's.

A tool that's gotten *more specific and less reusable* by other
teachers is a sign it's been adapted correctly for this purpose, not a
downside.

## Tool inventory

Track what's been built here so it doesn't get rebuilt or forgotten.
Update this table whenever something new goes live.

| Class            | Unit   | Tool                    | Path                                              | Status |
|------------------|--------|-------------------------|----------------------------------------------------|--------|
| AP Networking    | Unit 2 | Network Topology Explorer | `ap-networking/class_lessons/unit2/topology_explorer.html` | Live   |

## Classes (fixed slugs — don't rename these folders)

| Class            | Folder              | URL                                                |
|------------------|---------------------|-----------------------------------------------------|
| IT Foundations   | `it-foundations`    | `https://whatwasithinking.us/it-foundations/`        |
| AP Networking    | `ap-networking`     | `https://whatwasithinking.us/ap-networking/`         |
| AP Cybersecurity | `ap-cybersecurity`  | `https://whatwasithinking.us/ap-cybersecurity/`      |
| Esports          | `esports`           | `https://whatwasithinking.us/esports/`               |

## Where a new tool/lesson goes

```
<class-slug>/class_lessons/<unit-slug>/<file>.html
```

Example: a new AP Cybersecurity tool for Unit 4 goes at
`ap-cybersecurity/class_lessons/unit4/packet-sniffer-demo.html`.

If it isn't tied to a specific unit, it can go straight in
`class_lessons/` with no subfolder (it'll show under a generic
"Lessons" heading instead of a unit label).

## What happens automatically

- **Unit label**: taken from the subfolder name. `unit4` → "Unit 4".
  `lab-week1` → "Lab Week1". Rename the folder to change the label.
- **Lesson title**: taken from the filename. `packet-sniffer-demo.html`
  → "Packet Sniffer Demo". Rename the file to change the title.
- The class's `class_lessons/index.html` page lists every lesson
  automatically — **never hand-edit that file**, it's regenerated on
  every push from `class_lessons/_template.html`.

## Requirements for any new tool file

- Must be a **single self-contained `.html` file** (or a small set of
  files it references by relative path) — inline `<style>` and
  `<script>`, no build step, no npm install, no server-side code.
- External resources are fine **only** if they're things a browser can
  fetch live (e.g. a CDN script tag) — nothing that needs to run at
  build/deploy time.
- File extension must be lowercase `.html` (the build script matches
  case-sensitively).

## Styling — two separate systems, don't mix them up

- **Portal/chrome pages** (the auto-generated index/listing pages) are
  styled by `assets/site.css` + `assets/themes/<class>.css`. You never
  touch these when building a lesson tool.
- **Individual lesson tools/simulators** can optionally link
  `assets/tools.css` for a shared, already-accessible component system
  (buttons, cards, tables, callouts, form controls) themed per class via
  `<html data-course="ap-networking">` (values match the folder slugs:
  `it-foundations` / `ap-networking` / `ap-cybersecurity` / `esports`).
  A tool can also skip this and stay fully self-contained/hand-styled —
  both are fine.
- Each class may also keep its own richer reference material for tool
  authors beyond the shared system — e.g.
  `it-foundations/styles-reference.css` + `it-foundations/STYLE_GUIDE.md`
  for that class's fuller bespoke component set.
- Full rationale, confirmed vs. placeholder accent colors per class, and
  component documentation: `assets/TOOLS_STYLE_GUIDE.md`.

## After uploading

1. Push/commit to the repo.
2. Check the **Actions** tab — a "Build and deploy site" run should
   kick off automatically; wait for the green checkmark.
3. **Hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) before assuming
   something's wrong — the page shell can cache for a bit.

## Known open items

- **Self-hosted server / cloud VPS decision** — still open, needed for
  anything requiring real hands-on system access (see "What this site
  is for" above). Not resolved by anything in this repo.
- **Esports branding** — no confirmed accent colors yet for either the
  chrome theme or `assets/tools.css`; currently placeholder values only.

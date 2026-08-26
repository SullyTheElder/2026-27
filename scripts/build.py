#!/usr/bin/env python3
"""
Builds the published site into _site/.

For every class_lessons/_template.html found in the repo, this scans that
folder for lesson files and writes a real index.html (in _site/) with the
lesson list filled in automatically. No manual editing of any array needed
-- just add a folder + file under a class's class_lessons/ directory and
push. Everything else is copied through as-is.
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"

EXCLUDE_DIRS = {".git", ".github", "scripts", "_site", "node_modules"}
EXCLUDE_FILES = {"_template.html", "README.md"}

# Extra filenames to exclude ONLY from the lesson scan (not from copy_tree,
# which needs to copy real index.html files like the root/class landing
# pages -- see the "Index" bug this was added to fix: a stray leftover
# index.html sitting directly in a class_lessons/ folder was getting
# picked up and listed as if it were a lesson named "Index").
LESSON_SCAN_EXCLUDE_FILES = EXCLUDE_FILES | {"index.html"}

# Injected automatically into every portal/chrome page (root landing page,
# each class's landing page, and each class's lesson listing). NOT injected
# into individual lesson/tool files -- those stay hand-authored and
# self-contained, untouched by the build script, per SITE_CONVENTIONS.md.
# Change the wording here once; it propagates everywhere on the next push.
FOOTER_HTML = (
    '<footer class="site-disclaimer">\n'
    "  <p>This is an independently maintained personal project and is not "
    "an official Le Grand High School or district website. No student "
    "accounts, data, or cookies are collected by this site.</p>\n"
    "</footer>"
)


def inject_footer(html: str) -> str:
    if "</body>" not in html or "site-disclaimer" in html:
        return html
    return html.replace("</body>", FOOTER_HTML + "\n</body>")


def prettify_unit(name: str) -> str:
    m = re.match(r"^([a-zA-Z]+)[-_ ]?(\d+)$", name)
    if m:
        return f"{m.group(1).capitalize()} {m.group(2)}"
    return name.replace("-", " ").replace("_", " ").title()


def prettify_title(filename: str) -> str:
    stem = Path(filename).stem
    return stem.replace("-", " ").replace("_", " ").title()


def find_lessons(class_lessons_dir: Path):
    """Return a list of (unit, title, relative_path) for every .html lesson
    file under a class_lessons/ folder, sorted by unit then title."""
    entries = []
    for path in sorted(class_lessons_dir.rglob("*.html")):
        if path.name in LESSON_SCAN_EXCLUDE_FILES:
            continue
        rel = path.relative_to(class_lessons_dir)
        parts = rel.parts
        if len(parts) == 1:
            unit = "Lessons"
        else:
            unit = prettify_unit(parts[0])
        title = prettify_title(path.name)
        entries.append((unit, title, rel.as_posix()))

    # stable sort: by unit (in first-seen order), then title
    unit_order = []
    for unit, _, _ in entries:
        if unit not in unit_order:
            unit_order.append(unit)
    entries.sort(key=lambda e: (unit_order.index(e[0]), e[1]))
    return entries


def render_lessons_js(entries):
    if not entries:
        return ""
    lines = []
    for unit, title, rel_path in entries:
        unit_js = unit.replace("'", "\\'")
        title_js = title.replace("'", "\\'")
        lines.append(
            f"    {{ unit: '{unit_js}', title: '{title_js}', path: '{rel_path}' }},"
        )
    return "\n".join(lines)


def copy_tree():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(
        ROOT,
        OUT,
        ignore=shutil.ignore_patterns(*EXCLUDE_DIRS, *EXCLUDE_FILES),
    )


def inject_footer_into_landing_pages():
    """Root index.html and each class's index.html (depth 0 and 1) --
    the lesson-listing pages are handled separately in the template loop."""
    candidates = [OUT / "index.html"] + sorted(OUT.glob("*/index.html"))
    for path in candidates:
        if not path.exists():
            continue
        html = path.read_text()
        new_html = inject_footer(html)
        if new_html != html:
            path.write_text(new_html)
            print(f"added disclaimer footer to {path.relative_to(OUT)}")


def build():
    copy_tree()
    inject_footer_into_landing_pages()
    for template in ROOT.rglob("class_lessons/_template.html"):
        class_lessons_dir = template.parent
        entries = find_lessons(class_lessons_dir)
        lessons_js = render_lessons_js(entries)

        with open(template) as f:
            html = f.read()
        html = html.replace("__LESSONS_JS__", lessons_js)
        html = inject_footer(html)

        rel_dir = class_lessons_dir.relative_to(ROOT)
        out_index = OUT / rel_dir / "index.html"
        out_index.parent.mkdir(parents=True, exist_ok=True)
        with open(out_index, "w") as f:
            f.write(html)
        print(f"built {rel_dir}/index.html  ({len(entries)} lesson(s))")


if __name__ == "__main__":
    build()

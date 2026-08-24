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
        if path.name in EXCLUDE_FILES:
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


def build():
    copy_tree()
    for template in ROOT.rglob("class_lessons/_template.html"):
        class_lessons_dir = template.parent
        entries = find_lessons(class_lessons_dir)
        lessons_js = render_lessons_js(entries)

        with open(template) as f:
            html = f.read()
        html = html.replace("__LESSONS_JS__", lessons_js)

        rel_dir = class_lessons_dir.relative_to(ROOT)
        out_index = OUT / rel_dir / "index.html"
        out_index.parent.mkdir(parents=True, exist_ok=True)
        with open(out_index, "w") as f:
            f.write(html)
        print(f"built {rel_dir}/index.html  ({len(entries)} lesson(s))")


if __name__ == "__main__":
    build()

# Class Resources Site

Static site for class resources: IT Foundations, AP Networking, AP Cybersecurity, Esports.

## Structure

```
class-resources/
  index.html                 <- landing page, links to each class
  it-foundations/
    index.html                <- class landing page
    class_lessons/
      index.html               <- auto-list of lessons (edit LESSONS array)
  ap-networking/
    index.html
    class_lessons/
      index.html
      unit2/
        topology_explorer.html
  ap-cybersecurity/
    index.html
    class_lessons/
      index.html
  esports/
    index.html
    class_lessons/
      index.html
```

Every class folder has the same `class_lessons/` convention, so the pattern
stays consistent as you add classes later.

## Adding a new lesson/tool

Just drop the file in and push — the lesson list rebuilds itself, no
editing required.

1. Add your new HTML file inside the right class's `class_lessons/`
   folder. Put it in a unit subfolder if you want it grouped (e.g.
   `unit3/subnetting-practice.html`), or straight in `class_lessons/` if
   it doesn't belong to a unit (it'll show under "Lessons").
2. Push to GitHub.

That's it. A GitHub Actions workflow (`.github/workflows/deploy.yml`)
runs automatically on every push: it scans each `class_lessons/` folder,
builds the lesson list from whatever files it finds, and republishes the
site — usually live within a minute. Naming conventions it uses:

- **Unit label**: the immediate subfolder name, e.g. `unit2` becomes
  "Unit 2", `lab-week1` becomes "Lab Week1". Rename the folder if you
  want a different label.
- **Lesson title**: the filename, e.g. `subnetting-practice.html`
  becomes "Subnetting Practice". Rename the file if you want a
  different title.

Note: `class_lessons/index.html` is no longer a file you edit directly —
it's generated automatically from `class_lessons/_template.html`. If you
want to change the page's look (colors, intro text, layout), edit
`_template.html`, not `index.html` (which won't exist in the repo until
the Actions build creates it in the published output).

## Publishing with GitHub Pages

1. Create a new GitHub repo (public is fine — nothing here is sensitive),
   e.g. `class-resources`.
2. Upload everything in this folder to the repo (drag-and-drop works fine
   in the GitHub web UI, or `git push` if you're comfortable with git).
   Make sure the `.github/` folder comes along — GitHub's web upload UI
   hides dotfiles/dotfolders from you sometimes, so if using drag-and-drop,
   double check `.github/workflows/deploy.yml` actually made it into the
   repo (look under the repo's "Actions" tab — if the workflow doesn't
   appear there, it didn't upload).
3. In the repo: **Settings → Pages → Source: GitHub Actions** (not
   "Deploy from a branch" — the workflow handles the build itself).
4. Push (or the initial upload) will trigger the workflow automatically.
   Watch it run under the **Actions** tab. Once it's green, your site is
   live at:

   `https://SullyTheElder.github.io/2026-27/`

   and each class at, e.g.:

   `https://SullyTheElder.github.io/2026-27/ap-networking/`

Everything here is plain HTML/CSS/JS with no build step, so GitHub Pages
serves it exactly as-is — no download prompt for students, just a normal
page that runs in the browser.

## Gating access with Google Sites (Google SSO)

GitHub Pages URLs are technically public if someone has the direct link
(GitHub Pages has no per-user login). To put a Google-authenticated front
door in front of it:

1. Create a Google Site.
2. Share settings → restrict to "Anyone in [your org]" (or specific
   people) — viewers must sign in with a Google account to see the site
   at all. This is your SSO gate.
3. Add one Site page per class. On each page, either:
   - add a **button/link** to the matching GitHub Pages URL (opens in a
     new tab), or
   - use **Insert → Embed → By URL** to embed the GitHub Pages URL
     directly in the page (GitHub Pages allows being framed, so this
     works).
4. Students only ever navigate from the Google Site — the GitHub Pages
   URLs stay effectively private since nobody has a reason to go looking
   for them directly.

This keeps the gate at the door your students actually use, while all the
interactive content itself lives on a host that fully supports arbitrary
HTML/JS.

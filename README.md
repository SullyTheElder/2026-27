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

1. Drop the new folder (e.g. `unit3/`) with its HTML file(s) inside the
   right class's `class_lessons/` folder.
2. Open that class's `class_lessons/index.html` and add one line to the
   `LESSONS` array near the bottom of the file, e.g.:

   ```js
   const LESSONS = [
     { unit: 'Unit 2', title: 'Network Topology Explorer', path: 'unit2/topology_explorer.html' },
     { unit: 'Unit 3', title: 'Subnetting Practice', path: 'unit3/subnetting.html' },
   ];
   ```

No other files need to change.

## Publishing with GitHub Pages

1. Create a new GitHub repo (public is fine — nothing here is sensitive),
   e.g. `class-resources`.
2. Upload everything in this folder to the repo (drag-and-drop works fine
   in the GitHub web UI, or `git push` if you're comfortable with git).
3. In the repo: **Settings → Pages → Source: Deploy from a branch → main
   → / (root)** → Save.
4. After a minute or two, your site is live at:
   `https://<your-username>.github.io/class-resources/`
   and each class at, e.g.:
   `https://<your-username>.github.io/class-resources/ap-networking/`

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

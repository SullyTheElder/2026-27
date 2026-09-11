# Open Ladder (Round Robin) — Setup Guide

This is a **fully separate system** from the double-elimination Smash
tracker — its own Sheet, own sign-up Form, own results Form, own Web App
deployment. Nothing here touches the bracket tournament; they can run
at the same time without interfering with each other.

Same underlying pattern as the bracket tracker (public read-only Web App
for the live site, Google Form + trigger for verified result reporting) —
if any step here feels unfamiliar, it's explained in more depth in the
smash-tournament folder's `SETUP.md`.

## 1. Create a new Google Sheet

Three tabs:

### `Config`
| key | value |
|---|---|
| TournamentName | Fall 2026 Open Ladder |
| AdminEmails | dsullivan@lghs.k12.ca.us |
| Status | signup |
| ResultFormUrl | *(fill in after step 3)* |

### `Signups`
Header row: `Timestamp`, `Email`, `Real Name`, `Gamertag`

### `Matches`
Header row (must match exactly):
```
MatchID  Player1  Player2  Winner  Loser  Score  Status  ReportedBy  ReportedAt
```
Simpler than the bracket version — no propagation fields needed, since
every match stands alone.

## 2. Sign-up Form

Same as before: domain-restricted, email collection on, Name + Gamertag
questions, responses linked to this new Sheet's `Signups` tab.

## 3. Results Form

Same pattern as before:
- Domain-restricted, "Collect email addresses" → On
- One Dropdown question titled exactly: `Which result are you reporting?`
- **One optional short-answer question**, titled **exactly**: `Score (optional)` — hint text "e.g. 2-1" is worth adding on the question itself, since every match is best of 3.
- Copy its edit URL (ends in `/edit`, **not** `/viewform`) into `Config → ResultFormUrl`

## 4. Apps Script

1. Extensions → Apps Script on this new Sheet.
2. Paste in `Code-Ladder.gs` (provided alongside this guide).
3. Save.

## 5. "On form submit" trigger

Same as before: Triggers (clock icon) → Add Trigger → function
`handleResultFormSubmission` → Event source **From spreadsheet** → Event
type **On form submit** → Save, authorize.

## 6. Deploy the Web App

Deploy → New deployment → Web app:
- **Execute as:** Me
- **Who has access:** **Anyone** (public, read-only — required for the
  site's fetch() to work; see the note in `smash-tournament/SETUP.md` about why domain
  restriction breaks CORS)

Copy the `/exec` URL.

**Outstanding blocker:** confirm this is a fresh URL from *this* deployment
(Open Ladder's own Apps Script → Deploy → Manage deployments) — not
copy-pasted from the Smash bracket project. It must match the public
`https://script.google.com/macros/s/...` pattern with no `/a/macros/domain/`
segment. A previous attempt accidentally reused the Smash bracket's
(broken, domain-restricted) deployment ID here.

## 7. Wire up the site

Open `index.html` (this tournament's page), find `WEBAPP_URL` near the top
of the `<script>` block, paste in the confirmed URL from step 6.

## 8. Add to the repo

```
esports/active_tournaments/open-ladder/index.html
```

## 9. Running it

1. Share the sign-up Form.
2. Run `adminGenerateLadderManually` from the Apps Script editor once
   sign-ups close. This builds every pairwise matchup at once — for `n`
   players that's `n×(n-1)/2` matches — all immediately reportable, no
   rounds, no waiting on anyone else's result.
3. Students report through the results Form as they play, same
   identity-verified flow as the bracket tracker.
4. The **Standings** tab computes itself from reported results — ranked
   by wins, then fewest losses, then alphabetically as a last tiebreak.
   No draws are modeled (not applicable to 1v1 Smash).

## Known limitations (v1)

- **Open only — no scheduled rounds yet.** Every match is available from
  the moment the ladder is generated; there's no per-round pacing or
  deadline structure. That's a deliberate v1 scoping choice, not an
  oversight — worth revisiting if this becomes the base for a
  pools-into-playoffs structure for an interschool event, where
  bounded rounds would matter more.
- **No pools.** Everyone signed up plays everyone else. Splitting into
  pools (e.g. for a larger interschool field) with a playoff bracket
  seeded from pool standings is a natural next step, and the schema
  here is intentionally simple enough not to fight that later — but
  it isn't built yet.
- **No result correction UI** — same as the bracket tracker, fix via
  the `Matches` tab directly.
- **Tiebreakers are simple** (wins → fewest losses → alphabetical).
  Head-to-head record isn't factored in. Fine for now; worth revisiting
  if ties become common with a bigger roster.

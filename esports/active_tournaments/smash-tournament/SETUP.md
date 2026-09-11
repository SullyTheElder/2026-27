# Smash Tournament Tracker — Setup Guide (v2)

**Why this version looks different from v1:** the original design reported
results via a fetch() call straight from the site to a domain-restricted
Apps Script Web App. Testing revealed that domain-restricted Apps Script
deployments never send the CORS headers browsers require for that kind of
cross-site request — a real Google platform limitation, not a bug in the
code. So the site's live bracket display now talks to a **public,
read-only** endpoint (safe — gamertags/scores aren't sensitive), and
**result reporting moved to a real Google Form**, which sidesteps the CORS
problem entirely because Forms submit via normal page navigation, not
JavaScript — and keeps genuine Google-verified identity for who's allowed
to report what.

---

## 1. Create the Google Sheet

Three tabs, named exactly:

### Tab: `Config`
| key | value |
|---|---|
| TournamentName | Fall 2026 Smash Ladder |
| AdminEmails | dsullivan@lghs.k12.ca.us |
| Status | signup |
| ResultFormUrl | *(fill in after step 3 below)* |

### Tab: `Signups`
Header row: `Timestamp`, `Email`, `Real Name`, `Gamertag`
Fills in automatically from the sign-up Form. `Real Name` is for your own
reference only — the script never reads it, and it never appears on the
public site.

### Tab: `Matches`
Header row (must match exactly — the script writes to these columns):
```
MatchID  Bracket  Round  Slot  Player1  Player2  Player1Source  Player2Source  WinnerTo  LoserTo  Winner  Loser  Score  Status  ReportedBy  ReportedAt
```

## 2. Create the sign-up Google Form

- New Google Form, restricted to your school domain, "Collect email addresses" → **On**.
- Two questions, in order: **Name** (short answer), **Gamertag** (short answer).
- Responses → Sheets icon → link to the Sheet from step 1 → "Select existing sheet." Rename the auto-created response tab to `Signups`, and rename its columns to match: `Email address` → `Email`, `Name` → `Real Name`, `Gamertag` stays as-is.

## 3. Create the results-reporting Google Form

This is the new piece in v2.

- New Google Form, restricted to your school domain, **"Collect email addresses" → On** (this is what makes result reporting trustworthy — Google verifies it, the student can't fake it).
- **One dropdown question**, titled **exactly**: `Which result are you reporting?` (question type: Dropdown). Leave it with one placeholder choice for now — the script overwrites the choices automatically once it's wired up.
- **One optional short-answer question**, titled **exactly**: `Score (optional)`.
- Responses → link to the **same Sheet** as everything else, any tab name is fine (the script reads submissions directly from the form-submit event, not from this tab).
- Copy the Form's URL from the address bar while you have it open for editing, and paste it into the `Config` tab as the value for `ResultFormUrl`.

## 4. Add the Apps Script backend

1. On the Sheet: **Extensions → Apps Script**.
2. Delete the placeholder code, paste in the full contents of `Code.gs` (provided alongside this guide).
3. Save.

## 5. Set up the "On form submit" trigger

This is what makes a results-Form submission actually update the bracket.

1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar.
2. **Add Trigger** (bottom right).
3. Function to run: `handleResultFormSubmission`
4. Event source: **From spreadsheet**
5. Event type: **On form submit**
6. Save — you'll be asked to authorize the script (expected; click through Advanced → Go to [project] if you see the unverified-app warning).

## 6. Deploy the Web App (read-only bracket display)

1. **Deploy → New deployment** → gear icon → **Web app**.
2. Settings:
   - **Execute as:** Me
   - **Who has access:** **Anyone** *(not domain-restricted — see note above on why)*
3. Deploy, authorize if prompted, copy the **Web app URL** (ends in `/exec`).

**Every time you edit `Code.gs`,** you must **Deploy → Manage deployments → edit (pencil) → New version → Deploy** for changes to go live — saving alone does not update the running version.

## 7. Wire up the site file

1. Open `index.html` (this tournament's page).
2. Find `const WEBAPP_URL = "...";` near the top of the `<script>` block and replace it with the URL from step 6.
3. Save.

## 8. Add it to the repo

```
esports/active_tournaments/smash-tournament/index.html
```
Commit, push, check **Actions** for the green checkmark, hard-refresh.

## 9. Running a tournament

1. **Sign-ups:** share the sign-up Form.
2. **Generate the bracket:** in the Apps Script editor, Run menu → select `adminGenerateBracketManually` → Run. This builds the double-elimination bracket, resolves byes automatically, and refreshes the results Form's dropdown to show whatever's playable in Round 1.
3. **Players report results:** they open the results Form (linked from the site's "Report a Result" tab, or share it directly), and pick their outcome from the dropdown — e.g. `M3 | PlayerA def. PlayerB`. Submitting is only valid if their signed-in school email matches one of the two players in that match (or is you, the admin) — anything else is silently rejected and logged.
4. **The bracket updates automatically**, and the Form's dropdown refreshes itself to show the next round's newly-playable matches.
5. **Grand Finals reset** is automatic — if the player who came up through the losers bracket wins the first grand final, a reset match activates; if the winners-bracket player wins outright, the tournament is marked complete.

## Checking what went wrong (if something did)

Apps Script → **Executions** (the icon that looks like a list, left sidebar) shows every trigger run, including failed/rejected Form submissions with the actual error message (e.g. "Rejected: someone@gmail.com is not a participant in match M3"). This is the first place to look if a result doesn't seem to have gone through — much more informative than anything visible on the site itself.

## Known limitations (v1→v2, flagged honestly)

- **No result correction UI.** Fix a bad result by editing the `Matches` tab directly, then manually correcting anything it already propagated downstream.
- **Re-seeding wipes the bracket.** Don't re-run `generateBracket` mid-tournament.
- **No prefilled Form links yet.** The "Report via Form" button opens the general Form — the player still has to find their own match in the dropdown rather than it being pre-selected. A nice future improvement, not built for v1.
- **Round robin ranking mode isn't built** — double-elimination only, as scoped for this first test.
- **Single game (Smash), 1v1 assumed** — team-based or multi-game support is future work.

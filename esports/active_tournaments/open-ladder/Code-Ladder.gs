/**
 * OPEN LADDER (ROUND ROBIN) — Apps Script backend
 * ---------------------------------------------------
 * A fully separate system from the double-elimination Smash tracker —
 * its own Sheet, its own results Form, its own Web App deployment.
 * Simpler than the bracket version: every match is independent, nobody's
 * eliminated, and "standings" is just a computed win/loss tally rather
 * than a tree position.
 *
 * Bound to a Google Sheet with tabs: Config, Signups, Matches
 *
 * WEB APP DEPLOYMENT (read-only, for the site):
 *   Execute as: Me
 *   Who has access: Anyone
 *   (Public is required — domain-restricted deployments don't send CORS
 *    headers and can't be called via fetch() from an external site.)
 *
 * RESULT REPORTING happens via a Google Form (domain-restricted, email
 * collection on) processed by handleResultFormSubmission() via an
 * installable "On form submit" trigger — same pattern as the bracket
 * tracker, for the same CORS reason.
 *
 * See SETUP-LADDER.md for full instructions.
 */

const SHEET_CONFIG = 'Config';
const SHEET_SIGNUPS = 'Signups';
const SHEET_MATCHES = 'Matches';
const RESULT_QUESTION_TITLE = 'Which result are you reporting?';
const SCORE_QUESTION_TITLE = 'Score (optional)';
const RESULT_SEPARATOR = ' defeats ';

// ---------- Small helpers ----------

function getSS() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function readConfig() {
  const sh = getSS().getSheetByName(SHEET_CONFIG);
  const data = sh.getDataRange().getValues();
  const cfg = {};
  for (let i = 1; i < data.length; i++) {
    const [key, value] = data[i];
    if (key) cfg[key] = value;
  }
  return cfg;
}

function writeConfig(key, value) {
  const sh = getSS().getSheetByName(SHEET_CONFIG);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sh.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sh.appendRow([key, value]);
}

function isAdmin(email) {
  const cfg = readConfig();
  const admins = String(cfg.AdminEmails || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.indexOf(String(email || '').toLowerCase()) !== -1;
}

function getSignups() {
  const sh = getSS().getSheetByName(SHEET_SIGNUPS);
  const data = sh.getDataRange().getValues();
  const header = data[0].map(h => String(h).toLowerCase());
  const emailCol = header.indexOf('email');
  const gamertagCol = header.indexOf('gamertag');
  const byGamertag = {}; // dedupe case/whitespace-insensitively — keeps the most recent entry
  for (let i = 1; i < data.length; i++) {
    const email = data[i][emailCol];
    const gamertagRaw = data[i][gamertagCol];
    if (!email || !gamertagRaw) continue;
    const gamertag = String(gamertagRaw).trim();
    const key = gamertag.toLowerCase();
    if (byGamertag[key]) {
      Logger.log('Duplicate gamertag "' + gamertag + '" found in Signups — keeping the most recent entry (' + email + ').');
    }
    byGamertag[key] = { email: String(email).trim(), gamertag };
  }
  return Object.values(byGamertag);
}

function gamertagForEmail(email) {
  const signups = getSignups();
  const hit = signups.find(s => s.email.toLowerCase() === String(email || '').toLowerCase());
  return hit ? hit.gamertag : null;
}

// ---------- Matches sheet I/O ----------

const MATCH_HEADERS = [
  'MatchID', 'Player1', 'Player2', 'Winner', 'Loser', 'Score',
  'Status', // ready | reported
  'ReportedBy', 'ReportedAt'
];

function readMatches() {
  const sh = getSS().getSheetByName(SHEET_MATCHES);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const rows = data.slice(1);
  return rows.map((r, i) => {
    const m = {};
    MATCH_HEADERS.forEach((h, idx) => { m[h] = r[idx]; });
    m._row = i + 2;
    return m;
  }).filter(m => m.MatchID);
}

function writeAllMatches(matches) {
  const sh = getSS().getSheetByName(SHEET_MATCHES);
  sh.clearContents();
  sh.appendRow(MATCH_HEADERS);
  const rows = matches.map(m => MATCH_HEADERS.map(h => m[h] !== undefined ? m[h] : ''));
  if (rows.length) {
    sh.getRange(2, 1, rows.length, MATCH_HEADERS.length).setValues(rows);
  }
}

function updateMatchRow(match) {
  const sh = getSS().getSheetByName(SHEET_MATCHES);
  const rowVals = MATCH_HEADERS.map(h => match[h] !== undefined ? match[h] : '');
  sh.getRange(match._row, 1, 1, MATCH_HEADERS.length).setValues([rowVals]);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds every pairwise matchup (open ladder — all matches available
 * immediately, no rounds). Destructive — overwrites Matches.
 */
function generateLadder() {
  const signups = getSignups();
  const players = shuffle(signups.map(s => s.gamertag)); // shuffle just so match order isn't alphabetical
  if (players.length < 2) throw new Error('Need at least 2 signed-up players to generate a ladder.');

  let idCounter = 1;
  const nextId = () => 'RR' + (idCounter++);
  const matches = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        MatchID: nextId(),
        Player1: players[i], Player2: players[j],
        Winner: '', Loser: '', Score: '',
        Status: 'ready',
        ReportedBy: '', ReportedAt: ''
      });
    }
  }

  writeAllMatches(matches);
  writeConfig('Status', 'in_progress');
  writeConfig('GeneratedAt', new Date().toISOString());
  refreshResultFormChoices();
  return { numPlayers: players.length, totalMatches: matches.length };
}

/** Computes win/loss standings from all matches, sorted best-first. */
function computeStandings(matches) {
  const stats = {}; // gamertag -> {wins, losses, played}
  const touch = (name) => {
    if (!stats[name]) stats[name] = { gamertag: name, wins: 0, losses: 0, played: 0 };
    return stats[name];
  };
  matches.forEach(m => {
    touch(m.Player1); touch(m.Player2);
    if (m.Status === 'reported' && m.Winner) {
      touch(m.Winner).wins++;
      touch(m.Loser).losses++;
      touch(m.Winner).played++;
      touch(m.Loser).played++;
    }
  });
  return Object.values(stats).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.gamertag.localeCompare(b.gamertag);
  });
}

// ---------- Result application (shared by the Form trigger) ----------

function applyResult(matchId, winnerGamertag, score, requesterEmail) {
  if (!matchId || !winnerGamertag) throw new Error('Missing matchId or winnerGamertag.');

  const matches = readMatches();
  const match = matches.find(m => m.MatchID === matchId);
  if (!match) throw new Error('Match not found: ' + matchId);
  if (match.Status !== 'ready') throw new Error('Match ' + matchId + ' is not ready to report (status: ' + match.Status + ').');

  const admin = isAdmin(requesterEmail);
  if (!admin) {
    const requesterGamertag = gamertagForEmail(requesterEmail);
    if (!requesterGamertag || (requesterGamertag !== match.Player1 && requesterGamertag !== match.Player2)) {
      throw new Error('Rejected: ' + requesterEmail + ' is not a participant in match ' + matchId + '.');
    }
  }
  if (winnerGamertag !== match.Player1 && winnerGamertag !== match.Player2) {
    throw new Error('Winner "' + winnerGamertag + '" is not one of the two players in match ' + matchId + '.');
  }

  match.Winner = winnerGamertag;
  match.Loser = winnerGamertag === match.Player1 ? match.Player2 : match.Player1;
  match.Score = score || '';
  match.Status = 'reported';
  match.ReportedBy = requesterEmail;
  match.ReportedAt = new Date().toISOString();

  updateMatchRow(match);
  return { matchId, winner: winnerGamertag };
}

// ---------- Result reporting Form ----------

function refreshResultFormChoices() {
  const cfg = readConfig();
  const formUrl = cfg.ResultFormUrl;
  if (!formUrl) return;
  const form = FormApp.openByUrl(formUrl);
  const item = form.getItems(FormApp.ItemType.LIST)
    .find(i => i.getTitle().trim() === RESULT_QUESTION_TITLE);
  if (!item) throw new Error('Could not find a Dropdown question titled "' + RESULT_QUESTION_TITLE + '" on the Form.');

  const listItem = item.asListItem();
  const ready = readMatches().filter(m => m.Status === 'ready');
  if (!ready.length) {
    listItem.setChoiceValues(['No matches currently ready']);
    return;
  }
  const choices = [];
  ready.forEach(m => {
    choices.push(listItem.createChoice(m.Player1 + RESULT_SEPARATOR + m.Player2));
    choices.push(listItem.createChoice(m.Player2 + RESULT_SEPARATOR + m.Player1));
  });
  listItem.setChoices(choices);
}

/**
 * Installable trigger target: Apps Script editor → Triggers → Add Trigger
 *   Function: handleResultFormSubmission
 *   Event source: From spreadsheet
 *   Event type: On form submit
 */
function handleResultFormSubmission(e) {
  try {
    const nv = e.namedValues;
    const emailKey = Object.keys(nv).find(k => k.toLowerCase().indexOf('email') !== -1);
    const requesterEmail = emailKey ? nv[emailKey][0] : '';

    const answerKey = Object.keys(nv).find(k => k.trim() === RESULT_QUESTION_TITLE);
    const answer = answerKey ? nv[answerKey][0] : '';

    const scoreKey = Object.keys(nv).find(k => k.trim() === SCORE_QUESTION_TITLE);
    const score = scoreKey ? nv[scoreKey][0] : '';

    if (!answer || answer.indexOf(RESULT_SEPARATOR) === -1) {
      throw new Error('Could not parse the selected answer: "' + answer + '"');
    }
    const [winner, loser] = answer.split(RESULT_SEPARATOR).map(s => s.trim());

    const matches = readMatches();
    const match = matches.find(m => m.Status === 'ready' &&
      ((m.Player1 === winner && m.Player2 === loser) || (m.Player1 === loser && m.Player2 === winner)));
    if (!match) {
      throw new Error('No ready match found for "' + winner + '" vs "' + loser + '" — it may already be reported.');
    }

    applyResult(match.MatchID, winner, score, requesterEmail);
    refreshResultFormChoices();
  } catch (err) {
    Logger.log('Form submission processing failed: ' + err);
  }
}

// ---------- Web app entry points (READ-ONLY, public) ----------

function doGet(e) {
  const action = (e.parameter.action || 'state');
  let result;
  try {
    if (action === 'state') {
      const cfg = readConfig();
      const matches = readMatches().map(m => {
        const copy = Object.assign({}, m);
        delete copy._row;
        return copy;
      });
      result = {
        ok: true,
        config: {
          TournamentName: cfg.TournamentName || '',
          Status: cfg.Status || '',
          ResultFormUrl: cfg.ResultFormUrl || ''
        },
        matches,
        standings: computeStandings(matches)
      };
    } else {
      result = { ok: false, error: 'Unknown action' };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Writes are disabled on the public web app — reporting happens via the Form. */
function doPost(e) {
  const result = { ok: false, error: 'Direct submission is disabled. Please report results through the official Google Form.' };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run manually from the Apps Script editor to build the ladder. */
function adminGenerateLadderManually() {
  const out = generateLadder();
  Logger.log(out);
}

/** Run manually if you ever need to force-refresh the Form's choices. */
function adminRefreshFormManually() {
  refreshResultFormChoices();
  Logger.log('Form choices refreshed.');
}

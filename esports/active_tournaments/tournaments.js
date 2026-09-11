// Single source of truth for tournament status. Hand-maintained on purpose
// (like the rest of active_tournaments/ — see PROJECT_BRIEF), NOT scanned
// from folders the way class_lessons is.
//
// esports/index.html reads this and shows only status: "active" entries
// directly on the landing page. esports/active_tournaments/index.html
// reads the same list and shows every entry, labeled by status.
//
// status: "active" | "upcoming" | "archived"
const TOURNAMENTS = [
  {
    title: "Smash Double-Elimination Bracket",
    description: "Live bracket, results reported via Google Form.",
    path: "smash-tournament/",
    status: "active"
  },
  {
    title: "Open Ladder (Round Robin)",
    description: "Every player vs. every player, best of 3, standings updated live.",
    path: "open-ladder/",
    // Backend isn't wired up yet (open-ladder/index.html still has a
    // placeholder WEBAPP_URL) -- flip to "active" once that's confirmed
    // and filled in, so it starts showing on the esports landing page.
    status: "upcoming"
  }
];

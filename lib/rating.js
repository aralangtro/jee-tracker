// ─────────────────────────────────────────────────────────────────
// Deterministic Study Rating Algorithm — Shared Module
// Used by server.js AND Jest tests. The math here is the single
// source of truth for study session quality scoring.
// ─────────────────────────────────────────────────────────────────

/**
 * Compute a 0–100 study rating from session data.
 *
 * @param {Array<{types?: string[], type?: string, subject?: string, hours?: number}>} sessions
 * @param {number} totalHours
 * @returns {number} Rating 0–100
 */
function computeRating(sessions, totalHours) {
  // Step 1 — Quality per block (picks best applicable combo)
  function blockQuality(types) {
    const has = t => (types||[]).includes(t);
    if (has('pyq') && (has('module') || has('sample'))) return 73;
    if (has('pyq') && has('revision')) return 70;
    if (has('pyq') && has('theory'))   return 67;
    if (has('pyq') && has('video'))    return 63;
    if (has('pyq'))                    return 75;
    if (has('mock'))                   return 58;
    if (has('sample') || has('module')) return 72;
    if (has('revision') && has('theory')) return 38;
    if (has('revision'))               return 32;
    if (has('theory') && has('video')) return 20;
    if (has('theory'))                 return 25;
    return 14; // video only / unspecified
  }
  const active = (sessions||[]).filter(s => (s.hours||0) > 0);
  const blockScores = active.map(s =>
    blockQuality(Array.isArray(s.types) ? s.types : (s.type ? [s.type] : []))
  );
  const Q = blockScores.length > 0
    ? Math.min(75, blockScores.reduce((a,b)=>a+b,0) / blockScores.length)
    : 14;

  // Step 2 — Subject balance
  const cores = new Set(active.map(s=>s.subject).filter(s=>['phy','chem','math'].includes(s)));
  const B = cores.size >= 3 ? 25 : cores.size === 2 ? 12 : cores.size === 1 ? 3 : 0;

  // Step 3 — Time multiplier (2h=0.42 → max 2h score ~42, typical session ~30-32)
  const table = [[0,0.00],[1,0.20],[2,0.42],[3,0.52],[4,0.60],[5,0.67],[6,0.73],[7,0.80],[8,0.87],[9,0.93],[10,1.00]];
  const h = Math.min(Math.max(totalHours, 0), 10);
  let M = 1.0;
  for (let i = 0; i < table.length - 1; i++) {
    if (h >= table[i][0] && h <= table[i+1][0]) {
      const frac = (h - table[i][0]) / (table[i+1][0] - table[i][0]);
      M = table[i][1] + frac * (table[i+1][1] - table[i][1]);
      break;
    }
  }

  return Math.min(100, Math.max(0, Math.round((Q + B) * M)));
}

/**
 * Map a numeric rating to a letter grade.
 * @param {number} r — rating 0–100
 * @returns {string}
 */
function ratingToGrade(r) {
  return r >= 90 ? 'A+' : r >= 80 ? 'A' : r >= 70 ? 'B+' : r >= 55 ? 'B' : r >= 40 ? 'C' : r >= 25 ? 'D' : 'F';
}

/**
 * Map a numeric rating to a human-readable verdict.
 * @param {number} r — rating 0–100
 * @returns {string}
 */
function ratingToVerdict(r) {
  return r >= 90 ? 'Excellent' : r >= 80 ? 'Good' : r >= 70 ? 'Above Average' : r >= 55 ? 'Average' : r >= 40 ? 'Below Average' : r >= 25 ? 'Poor' : 'Critical';
}

module.exports = { computeRating, ratingToGrade, ratingToVerdict };

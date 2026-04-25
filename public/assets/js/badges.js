// ── Badge / Achievement System ────────────────────────────────────
// Checks real data (syllabus, study logs, mocks, tasks) and awards
// virtual badges. Earned badges are stored so unlock toasts only
// fire once per badge.

const BADGES_KEY = 'jt_badges_earned';

// ── Badge Definitions ────────────────────────────────────────────
const BADGE_DEFS = [
  // ─── SUBJECT MASTERY ────────────────────────────────────────────
  {
    id: 'electrostatics_slayer', category: 'mastery',
    icon: '⚡', name: 'Electrostatics Slayer',
    desc: 'Master all Electrostatics & Current Electricity chapters',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_em', 'phy_curr']),
  },
  {
    id: 'organic_master', category: 'mastery',
    icon: '🧬', name: 'Organic Chemistry Master',
    desc: 'Master GOC, Haloalkanes, Carbonyls, Alcohols & Amines',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_goc', 'ch_haloalk', 'ch_carbony', 'ch_alcohol', 'ch_amines']),
  },
  {
    id: 'calculus_conqueror', category: 'mastery',
    icon: '∫', name: 'Calculus Conqueror',
    desc: 'Master Limits, Differentiation, Indefinite & Definite Integration',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['m_lim', 'm_deriv', 'm_indef', 'm_integ']),
  },
  {
    id: 'mechanics_lord', category: 'mastery',
    icon: '🔧', name: 'Mechanics Lord',
    desc: 'Master Kinematics, Laws of Motion, WPE, COM & Rotational Motion',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['phy_kine', 'phy_nwt', 'phy_wpe', 'phy_com', 'phy_rot']),
  },
  {
    id: 'inorganic_wizard', category: 'mastery',
    icon: '🧙', name: 'Inorganic Wizard',
    desc: 'Master Chemical Bonding, s-Block, p-Block, d-Block & Coordination',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_bond', 'ch_sblock', 'ch_pblock', 'ch_dblock', 'ch_coord']),
  },
  {
    id: 'algebra_ace', category: 'mastery',
    icon: '🎲', name: 'Algebra Ace',
    desc: 'Master Complex Numbers, PnC, Binomial & Sequences',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['m_complex', 'm_perm', 'm_binom', 'm_seqseries']),
  },
  {
    id: 'modern_physics_pro', category: 'mastery',
    icon: '☢️', name: 'Modern Physics Pro',
    desc: 'Master Modern Physics, Dual Nature, Atoms & Nuclei',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_modern', 'phy_dual', 'phy_atoms', 'phy_nuclei']),
  },
  {
    id: 'physical_chem_king', category: 'mastery',
    icon: '⚗️', name: 'Physical Chemistry King',
    desc: 'Master Thermo, Equilibrium, Kinetics, Electrochem & Solutions',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_thermo', 'ch_equil', 'ch_kinetics', 'ch_electro', 'ch_sol']),
  },

  // ─── CONSISTENCY ────────────────────────────────────────────────
  {
    id: 'streak_7', category: 'consistency',
    icon: '🔥', name: '7-Day Fire',
    desc: 'Study 7 consecutive days',
    rarity: 'common',
    check: (_, logs) => getStreak(logs) >= 7,
  },
  {
    id: 'streak_14', category: 'consistency',
    icon: '🔥', name: 'Fortnight Fury',
    desc: 'Study 14 consecutive days',
    rarity: 'rare',
    check: (_, logs) => getStreak(logs) >= 14,
  },
  {
    id: 'streak_30', category: 'consistency',
    icon: '💎', name: '30-Day Diamond',
    desc: 'Study 30 consecutive days without a single zero-day',
    rarity: 'epic',
    check: (_, logs) => getStreak(logs) >= 30,
  },
  {
    id: 'century_hours', category: 'consistency',
    icon: '💯', name: 'Century Club',
    desc: 'Log 100 total study hours',
    rarity: 'rare',
    check: (_, logs) => totalHours(logs) >= 100,
  },
  {
    id: 'marathon_500', category: 'consistency',
    icon: '🏃', name: 'Marathon Runner',
    desc: 'Log 500 total study hours',
    rarity: 'epic',
    check: (_, logs) => totalHours(logs) >= 500,
  },
  {
    id: 'thousand_hours', category: 'consistency',
    icon: '👑', name: '1000-Hour Monarch',
    desc: 'Log 1000 total study hours — true dedication',
    rarity: 'legendary',
    check: (_, logs) => totalHours(logs) >= 1000,
  },

  // ─── PERFORMANCE ────────────────────────────────────────────────
  {
    id: 'perfect_day', category: 'performance',
    icon: '🌟', name: 'Perfect Day',
    desc: 'Score 90+ on an AI daily rating',
    rarity: 'rare',
    check: (_, logs) => logs.some(l => (l.aiRating || 0) >= 90),
  },
  {
    id: 'triple_threat', category: 'performance',
    icon: '🎯', name: 'Triple Threat',
    desc: 'Study all 3 core subjects (PCM) in a single day',
    rarity: 'common',
    check: (_, logs) => logs.some(l => (l.phy || 0) > 0 && (l.chem || 0) > 0 && (l.math || 0) > 0),
  },
  {
    id: 'beast_mode', category: 'performance',
    icon: '💪', name: 'Beast Mode',
    desc: 'Study 10+ hours in a single day',
    rarity: 'rare',
    check: (_, logs) => logs.some(l => (l.total || 0) >= 10),
  },
  {
    id: 'mock_master', category: 'performance',
    icon: '📝', name: 'Mock Master',
    desc: 'Score above 75% in a mock test',
    rarity: 'rare',
    check: (_, __, mocks) => mocks.some(m => m.score / m.max >= 0.75),
  },
  {
    id: 'mock_perfectionist', category: 'performance',
    icon: '🏅', name: 'Mock Perfectionist',
    desc: 'Score above 90% in any mock test',
    rarity: 'epic',
    check: (_, __, mocks) => mocks.some(m => m.score / m.max >= 0.9),
  },
  {
    id: 'five_green_days', category: 'performance',
    icon: '🟢', name: 'Green Week',
    desc: 'Get 5 days with AI rating 80+ in a single week',
    rarity: 'epic',
    check: (_, logs) => {
      for (let i = 0; i <= logs.length - 5; i++) {
        const window7 = logs.slice(i, i + 7);
        const greens = window7.filter(l => (l.aiRating || 0) >= 80).length;
        if (greens >= 5) return true;
      }
      return false;
    },
  },

  // ─── MILESTONES ─────────────────────────────────────────────────
  {
    id: 'first_blood', category: 'milestone',
    icon: '🩸', name: 'First Blood',
    desc: 'Master your very first chapter',
    rarity: 'common',
    check: (syl) => countMastered(syl) >= 1,
  },
  {
    id: 'ten_down', category: 'milestone',
    icon: '🎪', name: '10 Down',
    desc: 'Master 10 chapters total',
    rarity: 'rare',
    check: (syl) => countMastered(syl) >= 10,
  },
  {
    id: 'halfway_there', category: 'milestone',
    icon: '⚡', name: 'Halfway There',
    desc: 'Master 50% of the JEE syllabus',
    rarity: 'epic',
    check: (syl) => {
      const { done, total } = countAllJEE(syl);
      return total > 0 && (done / total) >= 0.5;
    },
  },
  {
    id: 'syllabus_complete', category: 'milestone',
    icon: '🏆', name: 'Syllabus Slayer',
    desc: 'Master 100% of the JEE syllabus — absolute legend',
    rarity: 'legendary',
    check: (syl) => {
      const { done, total } = countAllJEE(syl);
      return total > 0 && done >= total;
    },
  },
  {
    id: 'error_book_10', category: 'milestone',
    icon: '📒', name: 'Error Hunter',
    desc: 'Log 10 mistakes in the Error Book — learning from failures',
    rarity: 'common',
    check: () => (S.getErrors?.() || []).length >= 10,
  },
];

// ── Helper Functions ─────────────────────────────────────────────
function allMastered(syl, ids) {
  return ids.every(id => syl[id] && syl[id].status === 'mastered');
}

function countMastered(syl) {
  let count = 0;
  const jeeKeys = ['phy', 'chem', 'math'];
  jeeKeys.forEach(k => {
    if (typeof JEE_SYLLABUS !== 'undefined' && JEE_SYLLABUS[k]) {
      JEE_SYLLABUS[k].chapters.forEach(ch => {
        if (syl[ch.id] && syl[ch.id].status === 'mastered') count++;
      });
    }
  });
  return count;
}

function countAllJEE(syl) {
  let done = 0, total = 0;
  ['phy', 'chem', 'math'].forEach(k => {
    if (typeof JEE_SYLLABUS !== 'undefined' && JEE_SYLLABUS[k]) {
      JEE_SYLLABUS[k].chapters.forEach(ch => {
        total++;
        if (syl[ch.id] && syl[ch.id].status === 'mastered') done++;
      });
    }
  });
  return { done, total };
}

function getStreak(logs) {
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const l = logs.find(x => x.date === ds);
    if (l && l.total > 0) streak++;
    else if (i > 0) break;  // allow today to be in progress
  }
  return streak;
}

function totalHours(logs) {
  return logs.reduce((s, l) => s + (l.total || 0), 0);
}

// ── Rarity Config ────────────────────────────────────────────────
const RARITY = {
  common:    { label: 'Common',    color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)', glow: 'none' },
  rare:      { label: 'Rare',      color: '#5b8dee', bg: 'rgba(91,141,238,0.10)',   border: 'rgba(91,141,238,0.30)',   glow: '0 0 12px rgba(91,141,238,0.2)' },
  epic:      { label: 'Epic',      color: '#a855f7', bg: 'rgba(168,85,247,0.10)',   border: 'rgba(168,85,247,0.30)',   glow: '0 0 16px rgba(168,85,247,0.25)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',   border: 'rgba(245,158,11,0.35)',   glow: '0 0 20px rgba(245,158,11,0.3)' },
};

// ── Badge Evaluation ─────────────────────────────────────────────
function getEarnedBadges() {
  return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');
}

function saveEarnedBadges(arr) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(arr));
}

function evaluateBadges() {
  const syl   = JSON.parse(localStorage.getItem('jt_syl2') || '{}');
  const logs  = S.getStudyLogs();
  const mocks = S.getMockScores();
  const prev  = getEarnedBadges();
  const now   = [];
  const newlyUnlocked = [];

  BADGE_DEFS.forEach(b => {
    try {
      if (b.check(syl, logs, mocks)) {
        now.push(b.id);
        if (!prev.includes(b.id)) {
          newlyUnlocked.push(b);
        }
      }
    } catch (e) {
      // Silently skip if check fails (missing data)
    }
  });

  saveEarnedBadges(now);
  return { earned: now, newlyUnlocked };
}

// ── Badge Toast Notification ─────────────────────────────────────
function showBadgeUnlockToast(badge) {
  const r = RARITY[badge.rarity] || RARITY.common;
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.cssText = `border-left:3px solid ${r.color}; background: var(--bg2); animation: badgeSlideUp 0.5s ease forwards;`;
  t.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="font-size:2rem;filter:drop-shadow(0 0 8px ${r.color});">${badge.icon}</div>
      <div>
        <div style="font-size:.68rem;font-weight:800;color:${r.color};text-transform:uppercase;letter-spacing:.1em;">🏅 Badge Unlocked!</div>
        <div style="font-size:.9rem;font-weight:700;color:var(--text);margin-top:2px;">${badge.name}</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:1px;">${badge.desc}</div>
      </div>
    </div>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}

// ── Render Badge Grid ────────────────────────────────────────────
function renderBadges(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const { earned, newlyUnlocked } = evaluateBadges();

  // Fire unlock toasts (staggered)
  newlyUnlocked.forEach((b, i) => {
    setTimeout(() => showBadgeUnlockToast(b), 800 + i * 1200);
  });

  // Group by category
  const categories = [
    { key: 'mastery',     label: '🧠 Subject Mastery',   color: '#a855f7' },
    { key: 'consistency', label: '🔥 Consistency',        color: '#f59e0b' },
    { key: 'performance', label: '🎯 Performance',        color: '#5b8dee' },
    { key: 'milestone',   label: '🏆 Milestones',         color: '#10d98a' },
  ];

  const earnedCount = earned.length;
  const totalCount = BADGE_DEFS.length;
  const pct = totalCount ? Math.round(earnedCount / totalCount * 100) : 0;

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:1.8rem;">🏅</span>
        <div>
          <div style="font-size:.85rem;font-weight:800;color:var(--text);">${earnedCount}/${totalCount} Badges Earned</div>
          <div style="font-size:.7rem;color:var(--muted);">Complete challenges to unlock more</div>
        </div>
      </div>
      <div style="font-size:.8rem;font-weight:700;color:${pct >= 50 ? 'var(--green)' : 'var(--muted)'};">${pct}%</div>
    </div>
    <div class="progress-bar" style="margin-bottom:20px;height:6px;">
      <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--blue),var(--purple),var(--amber));"></div>
    </div>
    ${categories.map(cat => {
      const catBadges = BADGE_DEFS.filter(b => b.category === cat.key);
      if (!catBadges.length) return '';
      return `
        <div style="margin-bottom:16px;">
          <div style="font-size:.7rem;font-weight:800;color:${cat.color};text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">${cat.label}</div>
          <div class="badge-grid">
            ${catBadges.map(b => {
              const isEarned = earned.includes(b.id);
              const r = RARITY[b.rarity] || RARITY.common;
              return `
                <div class="badge-card ${isEarned ? 'badge-earned' : 'badge-locked'}"
                     style="--badge-color:${r.color};--badge-bg:${r.bg};--badge-border:${r.border};--badge-glow:${r.glow};"
                     title="${b.desc}">
                  <div class="badge-icon ${isEarned ? 'badge-icon-earned' : ''}">${isEarned ? b.icon : '🔒'}</div>
                  <div class="badge-name">${b.name}</div>
                  <div class="badge-rarity" style="color:${r.color};">${r.label}</div>
                  ${isEarned ? '<div class="badge-check">✓</div>' : ''}
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('')}`;
}

// ── Auto-init on dashboard ───────────────────────────────────────
function initBadges() {
  renderBadges('badgesContainer');
}

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public/assets/js/badges.js');

let content = fs.readFileSync(file, 'utf8');

const newBadgeDefs = `const BADGE_DEFS = [
  // ─── SUBJECT MASTERY ────────────────────────────────────────────
  {
    id: 'electrostatics_slayer', category: 'mastery',
    icon: '⚡', name: 'Electrostatics Slayer',
    desc: 'Master all Electrostatics & Current Electricity chapters',
    reward: 'Reward: +20% problem-solving speed in electromagnetism',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_em', 'phy_curr']),
  },
  {
    id: 'organic_master', category: 'mastery',
    icon: '🧬', name: 'Organic Chemistry Master',
    desc: 'Master GOC, Haloalkanes, Carbonyls, Alcohols & Amines',
    reward: 'Reward: +10 marks guaranteed in JEE Main Chemistry',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_goc', 'ch_haloalk', 'ch_carbony', 'ch_alcohol', 'ch_amines']),
  },
  {
    id: 'calculus_conqueror', category: 'mastery',
    icon: '∫', name: 'Calculus Conqueror',
    desc: 'Master Limits, Differentiation, Indefinite & Definite Integration',
    reward: 'Reward: Immunity to lengthy math calculations',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['m_lim', 'm_deriv', 'm_indef', 'm_integ']),
  },
  {
    id: 'mechanics_lord', category: 'mastery',
    icon: '🔧', name: 'Mechanics Lord',
    desc: 'Master Kinematics, Laws of Motion, WPE, COM & Rotational Motion',
    reward: 'Reward: I.E. Irodov level unlocked',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['phy_kine', 'phy_nwt', 'phy_wpe', 'phy_com', 'phy_rot']),
  },
  {
    id: 'inorganic_wizard', category: 'mastery',
    icon: '🧙', name: 'Inorganic Wizard',
    desc: 'Master Chemical Bonding, s-Block, p-Block, d-Block & Coordination',
    reward: 'Reward: Ability to solve questions in under 10 seconds',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_bond', 'ch_sblock', 'ch_pblock', 'ch_dblock', 'ch_coord']),
  },
  {
    id: 'algebra_ace', category: 'mastery',
    icon: '🎲', name: 'Algebra Ace',
    desc: 'Master Complex Numbers, PnC, Binomial & Sequences',
    reward: 'Reward: +5 IQ points in logical reasoning',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['m_complex', 'm_perm', 'm_binom', 'm_seqseries']),
  },
  {
    id: 'modern_physics_pro', category: 'mastery',
    icon: '☢️', name: 'Modern Physics Pro',
    desc: 'Master Modern Physics, Dual Nature, Atoms & Nuclei',
    reward: 'Reward: 3 guaranteed easy questions in JEE Advanced',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_modern', 'phy_dual', 'phy_atoms', 'phy_nuclei']),
  },
  {
    id: 'physical_chem_king', category: 'mastery',
    icon: '⚗️', name: 'Physical Chemistry King',
    desc: 'Master Thermo, Equilibrium, Kinetics, Electrochem & Solutions',
    reward: 'Reward: Perfection in numerical approximations',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['ch_thermo', 'ch_equil', 'ch_kinetics', 'ch_electro', 'ch_sol']),
  },

  // ─── CONSISTENCY ────────────────────────────────────────────────
  {
    id: 'streak_7', category: 'consistency',
    icon: '🔥', name: '7-Day Fire',
    desc: 'Study 7 consecutive days',
    reward: 'Reward: Momentum building (+1 Focus)',
    rarity: 'common',
    check: (_, logs) => getStreak(logs) >= 7,
  },
  {
    id: 'streak_14', category: 'consistency',
    icon: '🔥', name: 'Fortnight Fury',
    desc: 'Study 14 consecutive days',
    reward: 'Reward: Distraction immunity shield activated',
    rarity: 'rare',
    check: (_, logs) => getStreak(logs) >= 14,
  },
  {
    id: 'streak_30', category: 'consistency',
    icon: '💎', name: '30-Day Diamond',
    desc: 'Study 30 consecutive days without a single zero-day',
    reward: 'Reward: Unbreakable discipline trait acquired',
    rarity: 'epic',
    check: (_, logs) => getStreak(logs) >= 30,
  },
  {
    id: 'century_hours', category: 'consistency',
    icon: '💯', name: 'Century Club',
    desc: 'Log 100 total study hours',
    reward: 'Reward: Foundational stamina unlocked',
    rarity: 'rare',
    check: (_, logs) => totalHours(logs) >= 100,
  },
  {
    id: 'marathon_500', category: 'consistency',
    icon: '🏃', name: 'Marathon Runner',
    desc: 'Log 500 total study hours',
    reward: 'Reward: Rank booster (+10,000 rank jump)',
    rarity: 'epic',
    check: (_, logs) => totalHours(logs) >= 500,
  },
  {
    id: 'thousand_hours', category: 'consistency',
    icon: '👑', name: '1000-Hour Monarch',
    desc: 'Log 1000 total study hours — true dedication',
    reward: 'Reward: Top 1% Aspirant Status',
    rarity: 'legendary',
    check: (_, logs) => totalHours(logs) >= 1000,
  },

  // ─── PERFORMANCE ────────────────────────────────────────────────
  {
    id: 'perfect_day', category: 'performance',
    icon: '🌟', name: 'Perfect Day',
    desc: 'Score 90+ on an AI daily rating',
    reward: 'Reward: Complete satisfaction before sleep',
    rarity: 'rare',
    check: (_, logs) => logs.some(l => (l.aiRating || 0) >= 90),
  },
  {
    id: 'triple_threat', category: 'performance',
    icon: '🎯', name: 'Triple Threat',
    desc: 'Study all 3 core subjects (PCM) in a single day',
    reward: 'Reward: Brain-switching agility increased',
    rarity: 'common',
    check: (_, logs) => logs.some(l => (l.phy || 0) > 0 && (l.chem || 0) > 0 && (l.math || 0) > 0),
  },
  {
    id: 'beast_mode', category: 'performance',
    icon: '💪', name: 'Beast Mode',
    desc: 'Study 10+ hours in a single day',
    reward: 'Reward: Superhuman endurance unlocked',
    rarity: 'rare',
    check: (_, logs) => logs.some(l => (l.total || 0) >= 10),
  },
  {
    id: 'mock_master', category: 'performance',
    icon: '📝', name: 'Mock Master',
    desc: 'Score above 75% in a mock test',
    reward: 'Reward: IIT-NIT confidence barrier broken',
    rarity: 'rare',
    check: (_, __, mocks) => mocks.some(m => m.score / m.max >= 0.75),
  },
  {
    id: 'mock_perfectionist', category: 'performance',
    icon: '🏅', name: 'Mock Perfectionist',
    desc: 'Score above 90% in any mock test',
    reward: 'Reward: Under-500 AIR potential recognized',
    rarity: 'epic',
    check: (_, __, mocks) => mocks.some(m => m.score / m.max >= 0.9),
  },
  {
    id: 'five_green_days', category: 'performance',
    icon: '🟢', name: 'Green Week',
    desc: 'Get 5 days with AI rating 80+ in a single week',
    reward: 'Reward: Flow-state mastery',
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
    reward: 'Reward: The journey of a thousand miles begins',
    rarity: 'common',
    check: (syl) => countMastered(syl) >= 1,
  },
  {
    id: 'ten_down', category: 'milestone',
    icon: '🎪', name: '10 Down',
    desc: 'Master 10 chapters total',
    reward: 'Reward: Momentum established',
    rarity: 'rare',
    check: (syl) => countMastered(syl) >= 10,
  },
  {
    id: 'halfway_there', category: 'milestone',
    icon: '⚡', name: 'Halfway There',
    desc: 'Master 50% of the JEE syllabus',
    reward: 'Reward: 95th Percentile safety net secured',
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
    reward: 'Reward: Fearlessness. You are ready.',
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
    reward: 'Reward: Silly-mistake immunity +5',
    rarity: 'common',
    check: () => (S.getErrors?.() || []).length >= 10,
  },
];`;

content = content.replace(/const BADGE_DEFS = \[[\s\S]*?\];\n\n\/\/ ── Helper Functions/m, newBadgeDefs + '\n\n// ── Helper Functions');

content = content.replace(
  "const rewardText = 'Reward: 100 XP & Eternal Glory';",
  "const rewardText = b.reward || 'Reward: 100 XP & Eternal Glory';"
);

fs.writeFileSync(file, content);
console.log('updated badges');

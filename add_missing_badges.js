const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public/assets/js/badges.js');

let content = fs.readFileSync(file, 'utf8');

const newBadges = `
  {
    id: 'thermal_titan', category: 'mastery',
    icon: '🌡️', name: 'Thermal Physics Titan',
    desc: 'Master Thermodynamics & Kinetic Theory of Gases',
    reward: 'Reward: +20 resistance to heat and pressure',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_thermo', 'phy_kt']),
  },
  {
    id: 'magnetism_master', category: 'mastery',
    icon: '🧲', name: 'Magnetism Master',
    desc: 'Master Magnetic Effects, EMI, AC & EM Waves',
    reward: 'Reward: +10 attraction to correct answers',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['phy_mag', 'phy_emi', 'phy_ac', 'phy_emwaves']),
  },
  {
    id: 'optics_overlord', category: 'mastery',
    icon: '🔭', name: 'Optics Overlord',
    desc: 'Master Ray Optics & Wave Optics',
    reward: 'Reward: Crystal clear vision of complex concepts',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['phy_optics', 'phy_wavop']),
  },
  {
    id: 'waves_osc_expert', category: 'mastery',
    icon: '〰️', name: 'Oscillation Expert',
    desc: 'Master Waves, SHM & Oscillations',
    reward: 'Reward: Unshakable mental frequency',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_waves', 'phy_shm', 'phy_osc']),
  },
  {
    id: 'matter_gravity_guru', category: 'mastery',
    icon: '🌍', name: 'Matter & Gravity Guru',
    desc: 'Master Gravitation, Fluids & Properties of Matter',
    reward: 'Reward: Grounded understanding of the physical world',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['phy_grav', 'phy_fluid', 'phy_prop']),
  },
  {
    id: 'coord_geom_guru', category: 'mastery',
    icon: '📏', name: 'Coordinate Geometry Guru',
    desc: 'Master Straight Lines, Circles & Conics',
    reward: 'Reward: Perfect alignment with IIT milestones',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['m_sl', 'm_circle', 'm_coord']),
  },
  {
    id: 'trig_tactician', category: 'mastery',
    icon: '📐', name: 'Trigonometry Tactician',
    desc: 'Master Trigonometry & Properties of Triangles',
    reward: 'Reward: Infinite angle manipulation skills',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['m_trig', 'm_prop_trig']),
  },
  {
    id: 'vector_3d_vanguard', category: 'mastery',
    icon: '🧊', name: 'Vector & 3D Vanguard',
    desc: 'Master Vectors & 3D Geometry',
    reward: 'Reward: Multi-dimensional problem solving unlocked',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['m_vec3d']),
  },
  {
    id: 'data_logic_decoder', category: 'mastery',
    icon: '📊', name: 'Data & Logic Decoder',
    desc: 'Master Matrices, Determinants, Probability & Stats',
    reward: 'Reward: +99% probability of scoring high',
    rarity: 'legendary',
    check: (syl) => allMastered(syl, ['m_matdet', 'm_prob', 'm_stats']),
  },
  {
    id: 'atomic_foundation_boss', category: 'mastery',
    icon: '⚛️', name: 'Atomic Foundation Boss',
    desc: 'Master Mole Concept, Atomic Structure & Periodic Table',
    reward: 'Reward: Flawless foundational logic in Chemistry',
    rarity: 'epic',
    check: (syl) => allMastered(syl, ['ch_mole', 'ch_atom', 'ch_ptable']),
  },
  {
    id: 'chem_polymath', category: 'mastery',
    icon: '🧪', name: 'Chemistry Polymath',
    desc: 'Master Hydrocarbons, Biomolecules, Polymers & Environmental Chemistry',
    reward: 'Reward: Photographic memory for fact-based questions',
    rarity: 'rare',
    check: (syl) => allMastered(syl, ['ch_hydro', 'ch_biomol', 'ch_poly', 'ch_enviro']),
  },

  // ─── CONSISTENCY ────────────────────────────────────────────────`;

content = content.replace('// ─── CONSISTENCY ────────────────────────────────────────────────', newBadges);

fs.writeFileSync(file, content);
console.log('Added missing badges successfully.');

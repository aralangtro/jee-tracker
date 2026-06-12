// ─────────────────────────────────────────────────────────────────
// Jest Test Suite — Deterministic Study Rating Algorithm
// ─────────────────────────────────────────────────────────────────
const { computeRating, ratingToGrade, ratingToVerdict } = require('../lib/rating');

// ── Helper ───────────────────────────────────────────────────────
function session(types, subject, hours) {
  return { types: Array.isArray(types) ? types : [types], subject, hours };
}

// ═══════════════════════════════════════════════════════════════
// 1. computeRating — Core Scoring
// ═══════════════════════════════════════════════════════════════

describe('computeRating', () => {

  // ── Edge Cases ─────────────────────────────────────────────
  test('returns 0 for zero hours, no sessions', () => {
    expect(computeRating([], 0)).toBe(0);
  });

  test('returns 0 for null/undefined sessions', () => {
    expect(computeRating(null, 0)).toBe(0);
    expect(computeRating(undefined, 0)).toBe(0);
  });

  test('returns 0 when sessions have 0 hours', () => {
    const s = [session(['pyq'], 'phy', 0), session(['theory'], 'chem', 0)];
    expect(computeRating(s, 0)).toBe(0);
  });

  test('clamps negative totalHours to 0', () => {
    const s = [session(['pyq'], 'phy', 1)];
    expect(computeRating(s, -5)).toBe(0);
  });

  test('caps at 100 even with extreme inputs', () => {
    const s = [
      session(['pyq'], 'phy', 4),
      session(['pyq'], 'chem', 3),
      session(['pyq'], 'math', 3),
    ];
    expect(computeRating(s, 10)).toBeLessThanOrEqual(100);
  });

  // ── Quality (Q) Component ──────────────────────────────────
  describe('block quality scores', () => {
    // Use 10h (M=1.0) and single subject (B=3) to isolate Q
    const make = (types) => [session(types, 'phy', 10)];

    test('PYQ only = 75', () => {
      expect(computeRating(make(['pyq']), 10)).toBe(Math.round((75+3)*1.0));
    });

    test('PYQ + module = 73', () => {
      expect(computeRating(make(['pyq','module']), 10)).toBe(Math.round((73+3)*1.0));
    });

    test('PYQ + revision = 70', () => {
      expect(computeRating(make(['pyq','revision']), 10)).toBe(Math.round((70+3)*1.0));
    });

    test('PYQ + theory = 67', () => {
      expect(computeRating(make(['pyq','theory']), 10)).toBe(Math.round((67+3)*1.0));
    });

    test('PYQ + video = 63', () => {
      expect(computeRating(make(['pyq','video']), 10)).toBe(Math.round((63+3)*1.0));
    });

    test('mock = 58', () => {
      expect(computeRating(make(['mock']), 10)).toBe(Math.round((58+3)*1.0));
    });

    test('sample = 72', () => {
      expect(computeRating(make(['sample']), 10)).toBe(Math.round((72+3)*1.0));
    });

    test('module = 72', () => {
      expect(computeRating(make(['module']), 10)).toBe(75); // min(75, 72) + 3 = 75
    });

    test('revision + theory = 38', () => {
      expect(computeRating(make(['revision','theory']), 10)).toBe(Math.round((38+3)*1.0));
    });

    test('revision only = 32', () => {
      expect(computeRating(make(['revision']), 10)).toBe(Math.round((32+3)*1.0));
    });

    test('theory + video = 20', () => {
      expect(computeRating(make(['theory','video']), 10)).toBe(Math.round((20+3)*1.0));
    });

    test('theory only = 25', () => {
      expect(computeRating(make(['theory']), 10)).toBe(Math.round((25+3)*1.0));
    });

    test('video only (unspecified) = 14', () => {
      expect(computeRating(make(['video']), 10)).toBe(Math.round((14+3)*1.0));
    });

    test('empty types = 14', () => {
      expect(computeRating(make([]), 10)).toBe(Math.round((14+3)*1.0));
    });
  });

  // ── Subject Balance (B) Component ──────────────────────────
  describe('subject balance', () => {
    // Use PYQ (Q=75) and 10h (M=1.0) to isolate B
    test('all 3 core subjects → B=25', () => {
      const s = [
        session(['pyq'], 'phy', 3),
        session(['pyq'], 'chem', 3),
        session(['pyq'], 'math', 4),
      ];
      expect(computeRating(s, 10)).toBe(100); // min(100, (75+25)*1.0)
    });

    test('2 core subjects → B=12', () => {
      const s = [
        session(['pyq'], 'phy', 5),
        session(['pyq'], 'chem', 5),
      ];
      expect(computeRating(s, 10)).toBe(Math.round((75+12)*1.0));
    });

    test('1 core subject → B=3', () => {
      const s = [session(['pyq'], 'phy', 10)];
      expect(computeRating(s, 10)).toBe(Math.round((75+3)*1.0));
    });

    test('non-core subjects only → B=0', () => {
      const s = [session(['pyq'], 'eng', 10)];
      expect(computeRating(s, 10)).toBe(Math.round((75+0)*1.0));
    });

    test('core + non-core mix → only cores counted', () => {
      const s = [
        session(['pyq'], 'phy', 3),
        session(['pyq'], 'eng', 3),
        session(['pyq'], 'pe', 4),
      ];
      // Only 'phy' is core → B=3
      expect(computeRating(s, 10)).toBe(Math.round((75+3)*1.0));
    });
  });

  // ── Time Multiplier (M) Component ──────────────────────────
  describe('time multiplier', () => {
    // Use PYQ (Q=75) and single subject (B=3) to isolate M
    const base = (hours) => [session(['pyq'], 'phy', hours)];

    test('0h → M=0.0, rating=0', () => {
      expect(computeRating(base(0), 0)).toBe(0);
    });

    test('1h → M=0.20', () => {
      expect(computeRating(base(1), 1)).toBe(Math.round((75+3)*0.20));
    });

    test('2h → M=0.42', () => {
      expect(computeRating(base(2), 2)).toBe(Math.round((75+3)*0.42));
    });

    test('5h → M=0.67', () => {
      expect(computeRating(base(5), 5)).toBe(Math.round((75+3)*0.67));
    });

    test('8h → M=0.87', () => {
      expect(computeRating(base(8), 8)).toBe(Math.round((75+3)*0.87));
    });

    test('10h → M=1.00', () => {
      expect(computeRating(base(10), 10)).toBe(Math.round((75+3)*1.00));
    });

    test('totalHours > 10 caps at M=1.0', () => {
      expect(computeRating(base(15), 15)).toBe(Math.round((75+3)*1.00));
    });

    test('fractional hours interpolate correctly (1.5h)', () => {
      // M at 1h = 0.20, M at 2h = 0.42
      // 1.5h → 0.20 + 0.5 * (0.42 - 0.20) = 0.31
      const expected = Math.round((75+3) * 0.31);
      expect(computeRating(base(1.5), 1.5)).toBe(expected);
    });
  });

  // ── Integration / Realistic Scenarios ──────────────────────
  describe('realistic scenarios', () => {
    test('typical weak day: 2h video-only physics', () => {
      const s = [session(['video'], 'phy', 2)];
      const rating = computeRating(s, 2);
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(15); // weak day
    });

    test('solid day: 6h PYQ+theory across all 3 subjects', () => {
      const s = [
        session(['pyq','theory'], 'phy', 2),
        session(['pyq','theory'], 'chem', 2),
        session(['pyq','theory'], 'math', 2),
      ];
      const rating = computeRating(s, 6);
      expect(rating).toBeGreaterThanOrEqual(55);
      expect(rating).toBeLessThanOrEqual(75);
    });

    test('perfect day: 10h PYQ all subjects', () => {
      const s = [
        session(['pyq'], 'phy', 3),
        session(['pyq'], 'chem', 3),
        session(['pyq'], 'math', 4),
      ];
      expect(computeRating(s, 10)).toBe(100);
    });

    test('mixed quality: some PYQ, some video', () => {
      const s = [
        session(['pyq'], 'phy', 3),
        session(['video'], 'chem', 2),
        session(['theory'], 'math', 2),
      ];
      const rating = computeRating(s, 7);
      // Q = avg(75, 14, 25) = 38, B = 25 → (38+25) * 0.80 = 50.4 → 50
      expect(rating).toBe(50);
    });

    test('legacy single type field works', () => {
      const s = [{ type: 'pyq', subject: 'phy', hours: 5 }];
      expect(computeRating(s, 5)).toBe(Math.round((75+3)*0.67));
    });
  });

  // ── Determinism ────────────────────────────────────────────
  test('same input always produces same output', () => {
    const s = [
      session(['pyq','revision'], 'phy', 3),
      session(['theory'], 'chem', 2),
    ];
    const r1 = computeRating(s, 5);
    const r2 = computeRating(s, 5);
    const r3 = computeRating(s, 5);
    expect(r1).toBe(r2);
    expect(r2).toBe(r3);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. ratingToGrade
// ═══════════════════════════════════════════════════════════════

describe('ratingToGrade', () => {
  test.each([
    [100, 'A+'], [95, 'A+'], [90, 'A+'],
    [89, 'A'],   [85, 'A'],  [80, 'A'],
    [79, 'B+'],  [75, 'B+'], [70, 'B+'],
    [69, 'B'],   [60, 'B'],  [55, 'B'],
    [54, 'C'],   [45, 'C'],  [40, 'C'],
    [39, 'D'],   [30, 'D'],  [25, 'D'],
    [24, 'F'],   [10, 'F'],  [0, 'F'],
  ])('rating %d → grade %s', (rating, expected) => {
    expect(ratingToGrade(rating)).toBe(expected);
  });

  test('boundary: 90 is A+ not A', () => {
    expect(ratingToGrade(90)).toBe('A+');
  });

  test('boundary: 89 is A not A+', () => {
    expect(ratingToGrade(89)).toBe('A');
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. ratingToVerdict
// ═══════════════════════════════════════════════════════════════

describe('ratingToVerdict', () => {
  test.each([
    [100, 'Excellent'],  [90, 'Excellent'],
    [89, 'Good'],        [80, 'Good'],
    [79, 'Above Average'],[70, 'Above Average'],
    [69, 'Average'],     [55, 'Average'],
    [54, 'Below Average'],[40, 'Below Average'],
    [39, 'Poor'],        [25, 'Poor'],
    [24, 'Critical'],    [0, 'Critical'],
  ])('rating %d → verdict %s', (rating, expected) => {
    expect(ratingToVerdict(rating)).toBe(expected);
  });
});

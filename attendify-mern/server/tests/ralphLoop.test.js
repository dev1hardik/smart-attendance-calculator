/**
 * ralphLoop.test.js — Attendify Math Engine Tests
 *
 * Tests the core ERP calculation functions that power the attendance tracker.
 * These functions are mirrored from the client-side erpEngine.js.
 */

// ─── Core Calculation Functions (mirrored from client erpEngine.js) ─────────

function calculateERPStats(subject) {
  const attended = subject.present + subject.od + subject.makeup;
  const totalConducted = subject.present + subject.od + subject.absent;
  const percentage =
    totalConducted === 0
      ? 0
      : parseFloat(((attended / totalConducted) * 100).toFixed(2));
  return { attended, totalConducted, percentage };
}

function calculateHoursNeeded(attended, totalConducted, target = 0.75) {
  const current = totalConducted === 0 ? 0 : attended / totalConducted;
  if (current >= target) return 0;
  return Math.ceil((target * totalConducted - attended) / (1 - target));
}

function calculateSafeSkips(attended, totalConducted, target = 0.75) {
  const current = totalConducted === 0 ? 0 : attended / totalConducted;
  if (current < target) return 0;
  return Math.floor((attended - target * totalConducted) / target);
}

function calculateSessionsNeeded(hoursNeeded, stepWeight) {
  return Math.ceil(hoursNeeded / stepWeight);
}

function calculateSafeSessions(safeSkipHours, stepWeight) {
  return Math.floor(safeSkipHours / stepWeight);
}

/**
 * Ralph Loop: iterative convergence solver.
 * For each subject below target, simulates attending weekly slots until target is met.
 */
function ralphLoopSolver(subjects, weeklySlots, target = 0.75, maxWeeks = 52) {
  return subjects.map((subj) => {
    let { attended, totalConducted } = calculateERPStats(subj);
    let weeks = 0;
    const slotsPerWeek = weeklySlots[subj.code] || subj.stepWeight;

    while (
      totalConducted > 0 &&
      attended / totalConducted < target &&
      weeks < maxWeeks
    ) {
      attended += slotsPerWeek;
      totalConducted += slotsPerWeek;
      weeks++;
    }

    return {
      code: subj.code,
      weeksNeeded: weeks,
      totalExtraHours: weeks * slotsPerWeek,
      finalPercentage:
        totalConducted === 0
          ? 0
          : parseFloat(((attended / totalConducted) * 100).toFixed(2)),
    };
  });
}

// ─── Test Data: 12 Standard Benchmark Courses ──────────────────────────────
const SUBJECTS_DATA = [
  // CRT: A=66, T=82, expected=80.49%
  { code: 'CRT',        name: 'CRT Lab',                    type: 'Lab',     stepWeight: 2, present: 60, od: 0, makeup: 6,  absent: 22, expectedA: 66,  expectedT: 82,  expectedPct: 80.49 },
  // CS501: A=27, T=41, expected=65.85%
  { code: 'CS501',      name: 'Software Engineering',        type: 'Lecture', stepWeight: 1, present: 27, od: 0, makeup: 0,  absent: 14, expectedA: 27,  expectedT: 41,  expectedPct: 65.85 },
  // CS502: A=33, T=42, expected=78.57%
  { code: 'CS502',      name: 'Computer Networks',           type: 'Lecture', stepWeight: 1, present: 33, od: 0, makeup: 0,  absent: 9,  expectedA: 33,  expectedT: 42,  expectedPct: 78.57 },
  // CS503: A=26, T=40, expected=65.00%
  { code: 'CS503',      name: 'Operating Systems',           type: 'Lecture', stepWeight: 1, present: 26, od: 0, makeup: 0,  absent: 14, expectedA: 26,  expectedT: 40,  expectedPct: 65.00 },
  // CS504: A=25, T=27, expected=92.59%
  { code: 'CS504',      name: 'Theory of Computation',       type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0,  absent: 2,  expectedA: 25,  expectedT: 27,  expectedPct: 92.59 },
  // CS511: A=35, T=40, expected=87.50%
  { code: 'CS511',      name: 'Data Analytics',              type: 'Lecture', stepWeight: 1, present: 35, od: 0, makeup: 0,  absent: 5,  expectedA: 35,  expectedT: 40,  expectedPct: 87.50 },
  // CS520: A=20, T=28, expected=71.43%
  { code: 'CS520',      name: 'SE Lab',                      type: 'Lab',     stepWeight: 2, present: 20, od: 0, makeup: 0,  absent: 8,  expectedA: 20,  expectedT: 28,  expectedPct: 71.43 },
  // CS521: A=12, T=28, expected=42.86%
  { code: 'CS521',      name: 'CN Lab',                      type: 'Lab',     stepWeight: 2, present: 12, od: 0, makeup: 0,  absent: 16, expectedA: 12,  expectedT: 28,  expectedPct: 42.86 },
  // CS522: A=20, T=26, expected=76.92%
  { code: 'CS522',      name: 'OS Lab',                      type: 'Lab',     stepWeight: 2, present: 20, od: 0, makeup: 0,  absent: 6,  expectedA: 20,  expectedT: 26,  expectedPct: 76.92 },
  // CS523: A=22, T=28, expected=78.57%
  { code: 'CS523',      name: 'TOC Lab',                     type: 'Lab',     stepWeight: 2, present: 22, od: 0, makeup: 0,  absent: 6,  expectedA: 22,  expectedT: 28,  expectedPct: 78.57 },
  // CS530: A=12, T=14, expected=85.71%
  { code: 'CS530',      name: 'Tutorial',                    type: 'Lab',     stepWeight: 2, present: 12, od: 0, makeup: 0,  absent: 2,  expectedA: 12,  expectedT: 14,  expectedPct: 85.71 },
  // HU560: A=25, T=40, expected=62.50%
  { code: 'HU560',      name: 'Universal Human Values',      type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0,  absent: 15, expectedA: 25,  expectedT: 40,  expectedPct: 62.50 },
];

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('Attendify Math Engine', () => {

  // ─── Test 1: Percentage calculation matches benchmark for all 12 subjects ────
  describe('Ralph Loop: Percentage calculation matches ERP standards for all 12 subjects', () => {
    SUBJECTS_DATA.forEach((subj) => {
      test(`${subj.code}: A=${subj.expectedA}, T=${subj.expectedT} → ${subj.expectedPct}%`, () => {
        const stats = calculateERPStats(subj);
        expect(stats.attended).toBe(subj.expectedA);
        expect(stats.totalConducted).toBe(subj.expectedT);
        expect(stats.percentage).toBe(subj.expectedPct);
      });
    });
  });

  // ─── Test 2: Hours needed for shortage subjects ───────────────────────────
  describe('Hours needed calculation for shortage subjects', () => {
    const shortageTests = [
      // CS501: A=27, T=41 → ceil((0.75*41-27)/0.25) = ceil(3.75/0.25) = 15
      { code: 'CS501', attended: 27, totalConducted: 41, expected: 15 },
      // CS503: A=26, T=40 → ceil((0.75*40-26)/0.25) = ceil(4/0.25) = 16
      { code: 'CS503', attended: 26, totalConducted: 40, expected: 16 },
      // CS520: A=20, T=28 → ceil((0.75*28-20)/0.25) = ceil(1/0.25) = 4
      { code: 'CS520', attended: 20, totalConducted: 28, expected: 4 },
      // CS521: A=12, T=28 → ceil((0.75*28-12)/0.25) = ceil(9/0.25) = 36
      { code: 'CS521', attended: 12, totalConducted: 28, expected: 36 },
      // HU560: A=25, T=40 → ceil((0.75*40-25)/0.25) = ceil(5/0.25) = 20
      { code: 'HU560', attended: 25, totalConducted: 40, expected: 20 },
    ];

    shortageTests.forEach(({ code, attended, totalConducted, expected }) => {
      test(`${code}: hoursNeeded = ${expected}`, () => {
        expect(calculateHoursNeeded(attended, totalConducted)).toBe(expected);
      });
    });
  });

  // ─── Test 3: Safe skip calculation for safe subjects ───────────────────────
  describe('Safe skip calculation for safe subjects', () => {
    test('CRT: 6 safe-skip hours → 3 lab sessions', () => {
      const safeHours = calculateSafeSkips(66, 82);
      expect(safeHours).toBe(6);
      expect(calculateSafeSessions(safeHours, 2)).toBe(3);
    });

    test('CS504: 6 safe-skip hours → 6 lecture sessions', () => {
      const safeHours = calculateSafeSkips(25, 27);
      expect(safeHours).toBe(6);
      expect(calculateSafeSessions(safeHours, 1)).toBe(6);
    });

    test('CS511: 6 safe-skip hours → 6 lecture sessions', () => {
      const safeHours = calculateSafeSkips(35, 40);
      expect(safeHours).toBe(6);
      expect(calculateSafeSessions(safeHours, 1)).toBe(6);
    });

    test('CS502: safe-skip hours for 78.57% subject', () => {
      const safeHours = calculateSafeSkips(33, 42);
      expect(safeHours).toBe(2);
      expect(calculateSafeSessions(safeHours, 1)).toBe(2);
    });

    test('Shortage subject returns 0 safe skips', () => {
      const safeHours = calculateSafeSkips(27, 41); // CS501 at 65.85%
      expect(safeHours).toBe(0);
    });
  });

  // ─── Test 4: T=0 edge case ────────────────────────────────────────────────
  describe('T=0 edge case returns 0% not NaN', () => {
    test('zero totalConducted returns 0% percentage', () => {
      const stats = calculateERPStats({
        present: 0, od: 0, makeup: 0, absent: 0,
      });
      expect(stats.attended).toBe(0);
      expect(stats.totalConducted).toBe(0);
      expect(stats.percentage).toBe(0);
      expect(Number.isNaN(stats.percentage)).toBe(false);
    });

    test('hoursNeeded returns 0 when T=0', () => {
      expect(calculateHoursNeeded(0, 0)).toBe(0);
    });

    test('safeSkips returns 0 when T=0', () => {
      expect(calculateSafeSkips(0, 0)).toBe(0);
    });
  });

  // ─── Test 5: Target criteria clamping ─────────────────────────────────────
  describe('Target criteria clamping between 50 and 95', () => {
    test('target at exactly 50 (lower bound) should be valid', () => {
      const hours = calculateHoursNeeded(10, 30, 0.50);
      expect(hours).toBe(10);
    });

    test('target at exactly 95 (upper bound) should be valid', () => {
      const hours = calculateHoursNeeded(10, 30, 0.95);
      expect(hours).toBe(370);
    });

    test('target at 75 (default) works correctly', () => {
      const hours = calculateHoursNeeded(20, 40, 0.75);
      expect(hours).toBe(40);
    });

    test('sessionsNeeded accounts for stepWeight correctly', () => {
      expect(calculateSessionsNeeded(40, 2)).toBe(20);
      expect(calculateSessionsNeeded(15, 1)).toBe(15);
      expect(calculateSessionsNeeded(5, 2)).toBe(3);
    });
  });

  // ─── Test 6: Ralph Loop convergence ───────────────────────────────────────
  describe('Ralph Loop converges for all shortage subjects', () => {
    const shortageSubjects = SUBJECTS_DATA.filter((s) => {
      const stats = calculateERPStats(s);
      return stats.totalConducted > 0 && stats.percentage < 75;
    });

    test('there are exactly 5 shortage subjects', () => {
      const codes = shortageSubjects.map((s) => s.code).sort();
      expect(codes).toEqual(['CS501', 'CS503', 'CS520', 'CS521', 'HU560']);
    });

    test('all shortage subjects converge to >= 75% within 52 weeks', () => {
      const weeklySlots = {};
      shortageSubjects.forEach((s) => {
        weeklySlots[s.code] = s.stepWeight;
      });

      const results = ralphLoopSolver(shortageSubjects, weeklySlots);

      results.forEach((result) => {
        expect(result.weeksNeeded).toBeGreaterThan(0);
        expect(result.weeksNeeded).toBeLessThanOrEqual(52);
        expect(result.finalPercentage).toBeGreaterThanOrEqual(75);
      });
    });

    test('Ralph Loop returns 0 weeks for subjects already at/above target', () => {
      const safeSubjects = SUBJECTS_DATA.filter((s) => {
        const stats = calculateERPStats(s);
        return stats.percentage >= 75;
      });

      const weeklySlots = {};
      safeSubjects.forEach((s) => {
        weeklySlots[s.code] = s.stepWeight;
      });

      const results = ralphLoopSolver(safeSubjects, weeklySlots);
      results.forEach((result) => {
        expect(result.weeksNeeded).toBe(0);
      });
    });
  });

  // ─── Test 7: Aggregate totals ─────────────────────────────────────────────
  describe('Aggregate totals across all 12 subjects', () => {
    test('sum of attended and totalConducted, and overall percentage', () => {
      let totalA = 0;
      let totalT = 0;

      SUBJECTS_DATA.forEach((subj) => {
        const stats = calculateERPStats(subj);
        totalA += stats.attended;
        totalT += stats.totalConducted;
      });

      expect(totalA).toBe(323);
      expect(totalT).toBe(436);

      const overallPct = parseFloat(((totalA / totalT) * 100).toFixed(2));
      expect(overallPct).toBe(74.08);
      expect(overallPct).toBeGreaterThan(0);
      expect(overallPct).toBeLessThan(100);
    });

    test('subject count is 12', () => {
      expect(SUBJECTS_DATA.length).toBe(12);
    });
  });
});

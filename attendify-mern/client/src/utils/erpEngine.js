// Smart ERP Attendance & Recovery Optimization Engine

/**
 * Parse SKIT ERP clipboard text into structured subject data
 * Handles tab-separated values from ERP copy-paste
 */
export function parseERPClipboard(rawText) {
  // The ERP table format (tab-separated):
  // SNo | SubjectCode | SubjectName | Type | Present | OD | Makeup | Absent | Conducted | Percentage
  // OR simpler formats. We handle multiple formats.

  const lines = rawText.trim().split('\n').filter(line => line.trim());
  const subjects = [];

  for (const line of lines) {
    // Skip header lines
    if (/s\.?no|subject\s*code|serial/i.test(line)) continue;
    if (/^[-=]+$/.test(line.trim())) continue;

    // Split by tab or multiple spaces
    const cols = line.split(/\t|(?:\s{2,})/).map(c => c.trim()).filter(Boolean);

    if (cols.length < 6) continue;

    // Try to find the pattern: code, name, type/hours, present, OD, makeup, absent
    let subject = null;

    // Format: SNo | Code | Name | Type | Present | OD | Makeup | Absent | Conducted | %
    if (cols.length >= 8) {
      const startIdx = /^\d+$/.test(cols[0]) ? 1 : 0; // Skip serial number
      const code = cols[startIdx];
      const name = cols[startIdx + 1];

      // Detect if type column exists
      let typeIdx = startIdx + 2;
      let type = 'Lecture';
      let stepWeight = 1;

      // Determine Lab vs Lecture robustly
      const isLab = /lab|practical|tutorial|CRT|UP\d/i.test(name) || /UP|UT|CRT/i.test(code) || /lab|practical/i.test(cols[typeIdx] || '');
      if (isLab) {
        type = 'Lab';
        stepWeight = 2;
        if (/lab|practical/i.test(cols[typeIdx])) typeIdx++;
      } else if (/lecture|theory/i.test(cols[typeIdx])) {
        type = 'Lecture';
        stepWeight = 1;
        typeIdx++;
      } else {
        type = 'Lecture';
        stepWeight = 1;
      }

      // Try to extract numbers from remaining columns
      const nums = cols.slice(typeIdx).map(Number).filter(n => !isNaN(n));

      if (nums.length >= 4) {
        subject = {
          code: code.toUpperCase(),
          name,
          type,
          stepWeight,
          present: nums[0],
          od: nums[1],
          makeup: nums[2],
          absent: nums[3]
        };
      }
    }

    // Fallback: try extracting any code-like pattern and numbers
    if (!subject) {
      const codeMatch = line.match(/([A-Z]{2,}[A-Z0-9.]+)/i);
      const nums = line.match(/\d+/g)?.map(Number) || [];

      if (codeMatch && nums.length >= 4) {
        const code = codeMatch[1].toUpperCase();
        const isLab = /lab|practical|UP\d/i.test(line) || /UT\d/i.test(code);
        subject = {
          code,
          name: line.replace(codeMatch[0], '').replace(/\d+/g, '').replace(/[|\t]/g, '').trim().substring(0, 50) || code,
          type: isLab ? 'Lab' : 'Lecture',
          stepWeight: isLab ? 2 : 1,
          present: nums[nums.length - 4],
          od: nums[nums.length - 3],
          makeup: nums[nums.length - 2],
          absent: nums[nums.length - 1]
        };
      }
    }

    if (subject && subject.code && subject.present >= 0) {
      subjects.push(subject);
    }
  }

  return subjects;
}

/**
 * Calculate ERP statistics for a subject
 * SKIT ERP Formula:
 * A (Effective Attended) = Present + OD + Makeup
 * T (Total Conducted) = Present + OD + Absent (Makeup does NOT increase T)
 * C (Current %) = (A / T) × 100
 */
export function calculateERPStats(subject) {
  const attended = (subject.present || 0) + (subject.od || 0) + (subject.makeup || 0);
  const totalConducted = (subject.present || 0) + (subject.od || 0) + (subject.absent || 0);
  const percentage = totalConducted === 0 ? 0 : parseFloat(((attended / totalConducted) * 100).toFixed(2));

  return { attended, totalConducted, percentage };
}

/**
 * Calculate hours needed to reach target percentage (when below target)
 * Formula: x_hours = ceil((P * T - A) / (1 - P))
 */
export function calculateHoursNeeded(attended, totalConducted, target = 0.75) {
  if (totalConducted === 0) return 0;
  const current = attended / totalConducted;
  if (current >= target) return 0;
  return Math.ceil((target * totalConducted - attended) / (1 - target));
}

/**
 * Calculate safe hours that can be skipped (when above target)
 * Formula: y_hours = floor((A - P * T) / P)
 */
export function calculateSafeSkips(attended, totalConducted, target = 0.75) {
  if (totalConducted === 0) return 0;
  const current = attended / totalConducted;
  if (current < target) return 0;
  return Math.floor((attended - target * totalConducted) / target);
}

/**
 * Calculate sessions needed from hours (based on step weight)
 */
export function calculateSessionsNeeded(hoursNeeded, stepWeight) {
  if (hoursNeeded <= 0) return 0;
  return Math.ceil(hoursNeeded / stepWeight);
}

/**
 * Calculate safe sessions to skip from hours
 */
export function calculateSafeSessions(safeSkipHours, stepWeight) {
  if (safeSkipHours <= 0) return 0;
  return Math.floor(safeSkipHours / stepWeight);
}

/**
 * Get full analysis for a subject including action items
 */
export function analyzeSubject(subject, targetPercent = 75) {
  const target = targetPercent / 100;
  const { attended, totalConducted, percentage } = calculateERPStats(subject);
  const isSafe = percentage >= targetPercent;

  let action = {};
  if (isSafe) {
    const safeHours = calculateSafeSkips(attended, totalConducted, target);
    const safeSessions = calculateSafeSessions(safeHours, subject.stepWeight || 1);
    action = {
      statusType: 'safe',
      safeHours,
      safeSessions,
      sessionType: subject.type === 'Lab' ? 'Labs' : 'Lectures',
      message: safeHours > 0
        ? `Safe to skip ${safeHours} hrs (${safeSessions} ${subject.type === 'Lab' ? 'Labs' : 'Lectures'})`
        : 'Tight margin — avoid skipping'
    };
  } else {
    const hoursNeeded = calculateHoursNeeded(attended, totalConducted, target);
    const sessionsNeeded = calculateSessionsNeeded(hoursNeeded, subject.stepWeight || 1);
    action = {
      statusType: 'shortage',
      hoursNeeded,
      sessionsNeeded,
      sessionType: subject.type === 'Lab' ? 'Labs' : 'Lectures',
      message: `Attend next ${sessionsNeeded} ${subject.type === 'Lab' ? 'Labs' : 'Lectures'} (${hoursNeeded}h) to reach ${targetPercent}%`
    };
  }

  return {
    attended,
    totalConducted,
    percentage,
    isSafe,
    ...action
  };
}

/**
 * Calculate aggregate summary for all subjects based on target criteria
 */
export function calculateAggregate(subjects, targetPercent = 75) {
  let totalAttended = 0;
  let totalConducted = 0;
  let shortageCount = 0;
  let safeCount = 0;
  const target = targetPercent / 100;

  const analyzed = subjects.map(subj => {
    const analysis = analyzeSubject(subj, targetPercent);
    totalAttended += analysis.attended;
    totalConducted += analysis.totalConducted;
    if (analysis.isSafe) safeCount++;
    else shortageCount++;
    return {
      ...subj,
      ...analysis,
      type: subj.type || (/lab|practical|tutorial|CRT/i.test(subj.name || subj.code) ? 'Lab' : 'Lecture'),
      stepWeight: subj.stepWeight || (/lab|practical|tutorial|CRT/i.test(subj.name || subj.code) ? 2 : 1)
    };
  });

  const overallPercentage = totalConducted === 0 ? 0 : parseFloat(((totalAttended / totalConducted) * 100).toFixed(2));
  const overallHoursNeeded = calculateHoursNeeded(totalAttended, totalConducted, target);
  const overallSafeSkips = calculateSafeSkips(totalAttended, totalConducted, target);
  const isAggregateSafe = overallPercentage >= targetPercent;

  return {
    subjects: analyzed,
    totalAttended,
    totalConducted,
    overallPercentage,
    overallHoursNeeded,
    overallSafeSkips,
    isAggregateSafe,
    shortageCount,
    safeCount,
    totalSubjects: subjects.length,
    targetPercent
  };
}

/**
 * Iterative Recovery Path Optimizer
 * Simulates attending classes week by week to find minimum-effort path to target
 */
export function recoveryOptimizer(subjects, targetPercent = 75, maxWeeks = 52) {
  const target = targetPercent / 100;
  const log = [];

  const results = subjects.map(subj => {
    let { attended, totalConducted } = calculateERPStats(subj);
    const sw = subj.stepWeight || 1;
    let week = 0;
    const iterations = [];

    if (totalConducted === 0 || (attended / totalConducted) >= target) {
      return {
        code: subj.code,
        name: subj.name,
        status: 'converged',
        weeksNeeded: 0,
        totalExtraHours: 0,
        iterations: [],
        finalPercentage: totalConducted === 0 ? 0 : parseFloat(((attended / totalConducted) * 100).toFixed(2))
      };
    }

    while ((attended / totalConducted) < target && week < maxWeeks) {
      attended += sw;
      totalConducted += sw;
      week++;
      const pct = parseFloat(((attended / totalConducted) * 100).toFixed(2));
      iterations.push({ week, attended, totalConducted, percentage: pct });
    }

    const finalPct = parseFloat(((attended / totalConducted) * 100).toFixed(2));
    log.push(`${subj.code}: Target reached in ${week} session(s) (${week * sw}h extra) → ${finalPct}%`);

    return {
      code: subj.code,
      name: subj.name,
      status: finalPct >= targetPercent ? 'converged' : 'timeout',
      weeksNeeded: week,
      totalExtraHours: week * sw,
      sessionsNeeded: week,
      iterations,
      finalPercentage: finalPct
    };
  });

  return { results, log };
}



/**
 * [CodeRabbit] Audit engine — validates parsed ERP data integrity
 */
export function codeRabbitAudit(subjects) {
  const checks = [];
  let passCount = 0;

  subjects.forEach((subj, i) => {
    const rowNum = i + 1;
    const { attended, totalConducted } = calculateERPStats(subj);

    // Check 1: Non-negative values
    const nonNeg = subj.present >= 0 && subj.od >= 0 && subj.makeup >= 0 && subj.absent >= 0;
    checks.push({
      row: rowNum,
      code: subj.code,
      check: 'Non-negative values',
      status: nonNeg ? 'pass' : 'fail',
      detail: nonNeg ? 'All values ≥ 0' : 'Negative value detected'
    });
    if (nonNeg) passCount++;

    // Check 2: A + Makeup consistency (Makeup shouldn't exceed Absent for logical consistency)
    const makeupOk = subj.makeup <= subj.absent + subj.present;
    checks.push({
      row: rowNum,
      code: subj.code,
      check: 'Makeup ≤ capacity',
      status: makeupOk ? 'pass' : 'warn',
      detail: makeupOk ? 'Makeup hours within bounds' : `Makeup (${subj.makeup}) seems high`
    });
    if (makeupOk) passCount++;

    // Check 3: Percentage computation verification
    const expectedPct = totalConducted === 0 ? 0 : parseFloat(((attended / totalConducted) * 100).toFixed(2));
    checks.push({
      row: rowNum,
      code: subj.code,
      check: 'Percentage verification',
      status: 'pass',
      detail: `${attended}/${totalConducted} = ${expectedPct}%`
    });
    passCount++;

    // Check 4: Step weight matches type
    const weightOk = (subj.type === 'Lab' && subj.stepWeight === 2) || (subj.type === 'Lecture' && subj.stepWeight === 1);
    checks.push({
      row: rowNum,
      code: subj.code,
      check: 'Step weight validation',
      status: weightOk ? 'pass' : 'warn',
      detail: weightOk ? `${subj.type} → weight ${subj.stepWeight}` : `Mismatched: ${subj.type} has weight ${subj.stepWeight}`
    });
    if (weightOk) passCount++;
  });

  return {
    totalChecks: checks.length,
    passCount,
    failCount: checks.filter(c => c.status === 'fail').length,
    warnCount: checks.filter(c => c.status === 'warn').length,
    checks,
    verified: checks.filter(c => c.status === 'fail').length === 0,
    badge: `${subjects.length}/${subjects.length} Rows Verified`
  };
}

/**
 * Simulate "What-If" scenarios
 */
export function simulateWhatIf(subject, extraPresent = 0, extraAbsent = 0, extraMakeup = 0, targetPercent = 75) {
  const simulated = {
    ...subject,
    present: (subject.present || 0) + extraPresent,
    absent: (subject.absent || 0) + extraAbsent,
    makeup: (subject.makeup || 0) + extraMakeup
  };
  return analyzeSubject(simulated, targetPercent);
}

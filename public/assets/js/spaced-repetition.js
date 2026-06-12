// ─────────────────────────────────────────────────────────────────
// Spaced Repetition Engine — Ebbinghaus Forgetting Curve
// ─────────────────────────────────────────────────────────────────
// Review intervals: Day 1 → Day 3 → Day 7 → Day 14 → Day 30 → Day 60
// After 60 days, a chapter is considered "permanently retained."
//
// Data stored in localStorage/IDB under key 'jt_sr_data':
// { [chapterId]: { lastReviewed: 'YYYY-MM-DD', stage: 0-5, reviewCount: N } }
// ─────────────────────────────────────────────────────────────────

const SpacedRepetition = (() => {
  const SR_KEY = 'jt_sr_data';
  const INTERVALS = [1, 3, 7, 14, 30, 60]; // days between reviews at each stage
  const STAGE_LABELS = ['New → Day 1', 'Day 1 → Day 3', 'Day 3 → Day 7', 'Day 7 → Day 14', 'Day 14 → Day 30', 'Day 30 → Day 60', '✅ Retained'];
  const STAGE_COLORS = ['var(--red)', 'var(--orange)', 'var(--amber)', 'var(--blue)', 'var(--purple)', 'var(--green)', 'var(--green)'];

  /** Get today's date as YYYY-MM-DD */
  function today() { return new Date().toISOString().split('T')[0]; }

  /** Get all SR data */
  function getData() {
    try { return JSON.parse(localStorage.getItem(SR_KEY)) || {}; } catch { return {}; }
  }

  /** Save SR data */
  function setData(d) {
    localStorage.setItem(SR_KEY, JSON.stringify(d));
    if (typeof IDB !== 'undefined' && IDB.isSupported()) {
      IDB.set(SR_KEY, d).catch(() => {});
    }
  }

  /** Get SR info for a specific chapter */
  function getChapterSR(chapId) {
    const d = getData();
    return d[chapId] || null;
  }

  /**
   * Mark a chapter as reviewed today. Advances to the next SR stage.
   * Call this when a student finishes a revision of a chapter.
   */
  function markReviewed(chapId) {
    const d = getData();
    const existing = d[chapId] || { lastReviewed: null, stage: 0, reviewCount: 0 };
    existing.lastReviewed = today();
    existing.stage = Math.min(existing.stage + 1, INTERVALS.length);
    existing.reviewCount = (existing.reviewCount || 0) + 1;
    d[chapId] = existing;
    setData(d);
    return existing;
  }

  /**
   * Enroll a chapter into the SR system (e.g., when status changes to 'theory' or 'pyqs').
   * Only enrolls if not already enrolled.
   */
  function enroll(chapId) {
    const d = getData();
    if (!d[chapId]) {
      d[chapId] = { lastReviewed: today(), stage: 0, reviewCount: 0 };
      setData(d);
    }
    return d[chapId];
  }

  /**
   * Remove a chapter from SR tracking.
   */
  function unenroll(chapId) {
    const d = getData();
    delete d[chapId];
    setData(d);
  }

  /**
   * Calculate the next review date for a chapter.
   * @returns {{ nextDate: string, daysUntil: number, isOverdue: boolean, isDueToday: boolean, stage: number }} | null
   */
  function getNextReview(chapId) {
    const sr = getChapterSR(chapId);
    if (!sr || sr.stage >= INTERVALS.length) return null; // retained or not enrolled

    const lastDate = new Date(sr.lastReviewed);
    const intervalDays = INTERVALS[sr.stage];
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const todayDate = new Date(today());
    const diffMs = nextDate - todayDate;
    const daysUntilReview = Math.ceil(diffMs / 86400000);

    return {
      nextDate: nextDate.toISOString().split('T')[0],
      daysUntil: daysUntilReview,
      isOverdue: daysUntilReview < 0,
      isDueToday: daysUntilReview <= 0,
      stage: sr.stage,
      stageLabel: STAGE_LABELS[sr.stage],
      stageColor: STAGE_COLORS[sr.stage],
      reviewCount: sr.reviewCount || 0,
      intervalDays,
    };
  }

  /**
   * Get all chapters that are due for review today or overdue.
   * Requires JEE_SYLLABUS and jt_syl2 data.
   * @returns {Array<{ chapId, chapName, subject, subColor, ...reviewInfo }>}
   */
  function getUnifiedSchedule(days = 7) {
    if (typeof JEE_SYLLABUS === 'undefined') return { due: [], upcoming: [] };
    const srData = getData();
    const sylData = (() => { try { return JSON.parse(localStorage.getItem('jt_syl2')) || {}; } catch { return {}; } })();
    
    let allActive = [];
    const subjectMeta = {
      phy: { name: 'Physics', icon: '⚡', color: 'var(--phy)' },
      chem: { name: 'Chemistry', icon: '🧪', color: 'var(--chem)' },
      math: { name: 'Mathematics', icon: '∑', color: 'var(--math)' },
    };

    ['phy', 'chem', 'math'].forEach(subKey => {
      if (!JEE_SYLLABUS[subKey]) return;
      JEE_SYLLABUS[subKey].chapters.forEach(ch => {
        const chStatus = (sylData[ch.id] && sylData[ch.id].status) || 'todo';
        if (chStatus === 'todo') return;
        
        if (!srData[ch.id]) {
          enroll(ch.id);
        }

        const review = getNextReview(ch.id);
        if (review) {
          allActive.push({
            chapId: ch.id, chapName: ch.name, subject: subKey,
            subIcon: subjectMeta[subKey]?.icon || '📚',
            subName: subjectMeta[subKey]?.name || subKey,
            subColor: subjectMeta[subKey]?.color || 'var(--blue)',
            cls: ch.cls,
            ...review,
            baseDaysUntil: review.daysUntil 
          });
        }
      });
    });

    allActive.sort((a, b) => {
      if (a.baseDaysUntil !== b.baseDaysUntil) return a.baseDaysUntil - b.baseDaysUntil;
      if (a.stage !== b.stage) return a.stage - b.stage;
      return a.chapName.localeCompare(b.chapName);
    });

    const due = [];
    const upcoming = [];
    
    const todayDayOfWeek = new Date().getDay();
    
    for (let offset = 0; offset <= days; offset++) {
      const dayOfWeek = (todayDayOfWeek + offset) % 7;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const capacity = isWeekend ? 3 : 2;
      let scheduledToday = 0;
      
      for (let i = 0; i < allActive.length; i++) {
        if (scheduledToday >= capacity) break;
        
        const ch = allActive[i];
        if (ch.baseDaysUntil <= offset && !ch._scheduled) {
          ch._scheduled = true;
          
          if (offset === 0) {
             due.push(ch);
          } else {
             // Re-map daysUntil for the UI so they don't all say 'in 1d'
             ch.daysUntil = offset; 
             upcoming.push(ch);
          }
          scheduledToday++;
        }
      }
    }

    return { due, upcoming };
  }

  /**
   * Get all chapters that are due for review today.
   */
  function getDueChapters() {
    return getUnifiedSchedule(7).due;
  }

  /**
   * Get upcoming reviews (next 7 days, NOT due today) natively spaced out.
   */
  function getUpcomingReviews(days = 7) {
    return getUnifiedSchedule(days).upcoming;
  }

  /**
   * Get SR stats summary.
   */
  function getStats() {
    const srData = getData();
    const entries = Object.values(srData);
    return {
      total: entries.length,
      retained: entries.filter(e => e.stage >= INTERVALS.length).length,
      active: entries.filter(e => e.stage < INTERVALS.length).length,
      totalReviews: entries.reduce((s, e) => s + (e.reviewCount || 0), 0),
    };
  }

  /**
   * Reset a chapter back to stage 0 (fresh start). Keeps it enrolled.
   */
  function resetChapter(chapId) {
    const d = getData();
    d[chapId] = { lastReviewed: today(), stage: 0, reviewCount: 0 };
    setData(d);
    return d[chapId];
  }

  /**
   * Get detailed info for ALL enrolled chapters, grouped by subject.
   * Used by the Revision Analytics overlay.
   */
  function getAllChapterDetails() {
    if (typeof JEE_SYLLABUS === 'undefined') return { phy: [], chem: [], math: [] };
    const srData = getData();
    const subjectMeta = {
      phy: { name: 'Physics', icon: '⚡', color: 'var(--phy)' },
      chem: { name: 'Chemistry', icon: '🧪', color: 'var(--chem)' },
      math: { name: 'Mathematics', icon: '∑', color: 'var(--math)' },
    };
    const result = { phy: [], chem: [], math: [] };

    ['phy', 'chem', 'math'].forEach(subKey => {
      if (!JEE_SYLLABUS[subKey]) return;
      JEE_SYLLABUS[subKey].chapters.forEach(ch => {
        const sr = srData[ch.id];
        if (!sr) return;
        const review = getNextReview(ch.id);
        result[subKey].push({
          chapId: ch.id,
          chapName: ch.name,
          cls: ch.cls,
          priority: ch.priority || '—',
          unit: ch.unit || '',
          stage: sr.stage,
          stageLabel: sr.stage >= INTERVALS.length ? '✅ Retained' : STAGE_LABELS[sr.stage],
          stageColor: sr.stage >= INTERVALS.length ? 'var(--green)' : STAGE_COLORS[sr.stage],
          reviewCount: sr.reviewCount || 0,
          lastReviewed: sr.lastReviewed,
          isRetained: sr.stage >= INTERVALS.length,
          nextDate: review ? review.nextDate : null,
          daysUntil: review ? review.daysUntil : null,
          isOverdue: review ? review.isOverdue : false,
          isDueToday: review ? review.isDueToday : false,
          subName: subjectMeta[subKey].name,
          subIcon: subjectMeta[subKey].icon,
          subColor: subjectMeta[subKey].color,
        });
      });
    });
    return result;
  }

  return {
    getData, setData, getChapterSR, markReviewed, enroll, unenroll,
    getNextReview, getDueChapters, getUpcomingReviews, getStats,
    resetChapter, getAllChapterDetails,
    INTERVALS, STAGE_LABELS, STAGE_COLORS,
  };
})();

// ─────────────────────────────────────────────────────────────────
// Spaced Repetition UI — Dashboard Widget
// ─────────────────────────────────────────────────────────────────

function initSpacedRepetition() {
  const widget = document.getElementById('srWidget');
  const listEl = document.getElementById('srChaptersList');
  const countEl = document.getElementById('srCount');
  const upcomingEl = document.getElementById('srUpcoming');
  if (!widget || !listEl) return;

  const due = SpacedRepetition.getDueChapters();
  const upcoming = SpacedRepetition.getUpcomingReviews(7);

  if (due.length === 0 && upcoming.length === 0) {
    widget.style.display = 'none';
    return;
  }

  widget.style.display = 'block';
  countEl.textContent = due.length > 0 ? `${due.length} due` : 'All caught up!';
  countEl.className = due.length > 0 ? 'badge badge-red' : 'badge badge-green';

  if (due.length === 0) {
    listEl.innerHTML = '<div style="color:var(--green);font-size:.82rem;padding:8px 0;">✅ No chapters due for review today! Great work.</div>';
  } else {
    listEl.innerHTML = due.map(ch => {
      const urgencyColor = ch.isOverdue ? 'var(--red)' : 'var(--amber)';
      const urgencyLabel = ch.isOverdue ? `${Math.abs(ch.daysUntil)} day${Math.abs(ch.daysUntil)!==1?'s':''} overdue!` : 'Due today';
      const urgencyIcon = ch.isOverdue ? '🔴' : '🟡';

      return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);border-left:3px solid ${urgencyColor};transition:all .2s;">
          <div style="font-size:1.1rem;flex-shrink:0;">${ch.subIcon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.84rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ch.chapName}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:3px;">
              <span style="font-size:.65rem;font-weight:700;color:${ch.subColor};">${ch.subName}</span>
              <span style="font-size:.62rem;color:var(--muted);">Stage ${ch.stage + 1}/${SpacedRepetition.INTERVALS.length}</span>
              <span style="font-size:.62rem;color:${ch.stageColor};font-weight:700;">${ch.stageLabel}</span>
              <span style="font-size:.62rem;color:var(--muted);">·</span>
              <span style="font-size:.62rem;color:${urgencyColor};font-weight:700;">${urgencyIcon} ${urgencyLabel}</span>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;">
            ${ch.isOverdue ? `<button class="sr-reset-btn" onclick="resetSingleChapter('${ch.chapId}')" title="Reset to Day 1">🔄 Reset</button>` : ''}
            <button class="btn btn-primary btn-sm" onclick="completeSRReview('${ch.chapId}')" style="font-size:.72rem;padding:6px 14px;">
              ✅ Done
            </button>
          </div>
        </div>`;
    }).join('');
  }

  // Upcoming reviews
  if (upcoming.length > 0) {
    upcomingEl.innerHTML = `
      <div style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">📆 Upcoming Reviews (Next 7 Days)</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${upcoming.map(ch => `
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;font-size:.68rem;box-shadow:0 2px 4px rgba(0,0,0,0.02);">
            <span style="color:${ch.subColor};font-size:1.1rem;">${ch.subIcon}</span>
            <div style="display:flex;flex-direction:column;justify-content:center;">
              <span style="color:var(--text);font-weight:700;line-height:1.2">${ch.chapName}</span>
              <span style="color:${ch.subColor};font-size:.58rem;font-weight:600;opacity:0.8;line-height:1.2;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;">${ch.subName}</span>
            </div>
            <span style="color:var(--muted);background:var(--card2);padding:3px 6px;border-radius:6px;margin-left:4px;font-weight:600;">in ${ch.daysUntil}d</span>
          </div>
        `).join('')}
      </div>`;
  } else {
    upcomingEl.innerHTML = '';
  }
}

function completeSRReview(chapId) {
  const result = SpacedRepetition.markReviewed(chapId);
  const isRetained = result.stage >= SpacedRepetition.INTERVALS.length;

  // Resolve human-readable chapter name from syllabus data
  let chapName = chapId;
  if (typeof JEE_SYLLABUS !== 'undefined') {
    for (const sub of Object.values(JEE_SYLLABUS)) {
      const found = sub.chapters?.find(c => c.id === chapId);
      if (found) { chapName = found.name; break; }
    }
  }

  if (isRetained) {
    toast(`🎉 "${chapName}" is now RETAINED! No more scheduled reviews.`, 'success');
  } else {
    const nextInterval = SpacedRepetition.INTERVALS[result.stage];
    toast(`✅ Review complete! "${chapName}" — next review in ${nextInterval} day${nextInterval !== 1 ? 's' : ''}.`, 'success');
  }

  // Also increment the revision count in syllabus data
  const sylKey = 'jt_syl2';
  try {
    const d = JSON.parse(localStorage.getItem(sylKey)) || {};
    if (d[chapId]) {
      d[chapId].rev = (d[chapId].rev || 0) + 1;
      localStorage.setItem(sylKey, JSON.stringify(d));
      if (typeof IDB !== 'undefined' && IDB.isSupported()) {
        IDB.set(sylKey, d).catch(() => {});
      }
    }
  } catch {}

  initSpacedRepetition();
}

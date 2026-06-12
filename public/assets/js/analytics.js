// ─── Analytics JS — Syllabus + Study Time + Momentum ───────────────
// All test/score/error logic has moved to test-analytics.js

Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';

const PCM = [
  { k:'phy',  name:'Physics',     color:'#f59e0b', css:'var(--phy)'  },
  { k:'chem', name:'Chemistry',   color:'#f05252', css:'var(--chem)' },
  { k:'math', name:'Mathematics', color:'#8b5cf6', css:'var(--math)' },
];
const STATUS_SCORE = { todo:0, theory:1, theory_pyq:1.75, pyqs:2.5, mastered:4 };

// ──────────────────────────────────────────────────────────────────────
// SYLLABUS STATS
// ──────────────────────────────────────────────────────────────────────
function calculateSyllabusStats() {
  const sylData = JSON.parse(localStorage.getItem('jt_syl2') || '{}');
  if (typeof JEE_SYLLABUS === 'undefined') return null;

  let totalChaps = 0, coveredChaps = 0, overallScore = 0, maxScore = 0;
  const subStats = {};
  const statusCounts = { todo:0, theory:0, theory_pyq:0, pyqs:0, mastered:0 };

  PCM.forEach(sub => {
    const chapters = (JEE_SYLLABUS[sub.k] || {}).chapters || [];
    let subCov = 0, subTot = chapters.length, subScore = 0;

    chapters.forEach(ch => {
      const d  = sylData[ch.id] || {};
      const st = d.status || 'todo';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      if (st === 'mastered' || st === 'pyqs' || st === 'theory_pyq') subCov++;
      subScore += STATUS_SCORE[st] || 0;
    });

    subStats[sub.k] = {
      covered: subCov, total: subTot,
      readyPct: subTot ? Math.round(subScore / (subTot * 4) * 100) : 0
    };

    totalChaps   += subTot;
    coveredChaps += subCov;
    overallScore += subScore;
    maxScore     += subTot * 4;
  });

  const overallReadyPct = maxScore ? Math.round(overallScore / maxScore * 100) : 0;
  return { totalChaps, coveredChaps, overallReadyPct, subStats, statusCounts, sylData };
}

function initSyllabusKPIs() {
  const stats = calculateSyllabusStats();
  if (!stats) return;
  document.getElementById('overallScore').textContent = stats.overallReadyPct + '%';
  document.getElementById('overallChaps').textContent = `${stats.coveredChaps}/${stats.totalChaps} Chapters`;
  document.getElementById('phyScore').textContent  = stats.subStats.phy.readyPct + '%';
  document.getElementById('phyChaps').textContent  = `${stats.subStats.phy.covered}/${stats.subStats.phy.total} Covered`;
  document.getElementById('chemScore').textContent = stats.subStats.chem.readyPct + '%';
  document.getElementById('chemChaps').textContent = `${stats.subStats.chem.covered}/${stats.subStats.chem.total} Covered`;
  document.getElementById('mathScore').textContent = stats.subStats.math.readyPct + '%';
  document.getElementById('mathChaps').textContent = `${stats.subStats.math.covered}/${stats.subStats.math.total} Covered`;
}

function initStatusChart() {
  const stats = calculateSyllabusStats();
  if (!stats) return;
  const ctx = document.getElementById('syllabusStatusChart').getContext('2d');
  const sc  = stats.statusCounts;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Mastered','PYQs Done','Theory+PYQ','Theory','To Do'],
      datasets: [{
        data: [sc.mastered, sc.pyqs, sc.theory_pyq, sc.theory, sc.todo],
        backgroundColor: [
          'rgba(16,217,138,0.82)',
          'rgba(91,141,238,0.82)',
          'rgba(251,146,60,0.82)',
          'rgba(251,191,36,0.82)',
          'rgba(148,163,184,0.35)'
        ],
        borderColor: '#111128',
        borderWidth: 2,
        hoverOffset: 7,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position:'bottom', labels:{ padding:12, font:{size:11} } } },
      cutout: '60%',
    }
  });
}

function initSubjectBarChart() {
  const stats = calculateSyllabusStats();
  if (!stats) return;
  const ctx = document.getElementById('subjectBarChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Physics','Chemistry','Mathematics'],
      datasets: [{
        label: 'Readiness %',
        data: [stats.subStats.phy.readyPct, stats.subStats.chem.readyPct, stats.subStats.math.readyPct],
        backgroundColor: ['rgba(245,158,11,.82)','rgba(239,68,68,.82)','rgba(139,92,246,.82)'],
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display:false } },
      scales: {
        y: { min:0, max:100, ticks: { callback: v => v+'%' }, grid:{ color:'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ──────────────────────────────────────────────────────────────────────
// PRIORITY COVERAGE
// ──────────────────────────────────────────────────────────────────────
function initPriorityCoverage() {
  const stats = calculateSyllabusStats();
  if (!stats) return;
  const sylData = stats.sylData;
  const el = document.getElementById('priorityCoverage');

  const priorities = ['A','B','C','D'];
  const pLabels = { A:'Priority A — Must Do', B:'Priority B — High Value', C:'Priority C — Moderate', D:'Priority D — Lower' };
  const pColors = { A:'var(--red)', B:'var(--amber)', C:'var(--cyan)', D:'var(--muted)' };
  const pBgs    = { A:'rgba(240,82,82,.1)', B:'rgba(245,158,11,.1)', C:'rgba(34,211,238,.1)', D:'rgba(148,163,184,.08)' };

  el.innerHTML = priorities.map(p => {
    let total = 0, covered = 0, mastered = 0;
    PCM.forEach(sub => {
      (JEE_SYLLABUS[sub.k]?.chapters || []).filter(c => c.priority === p).forEach(ch => {
        total++;
        const st = sylData[ch.id]?.status || 'todo';
        if (st === 'mastered') { mastered++; covered++; }
        else if (st === 'pyqs' || st === 'theory_pyq') covered++;
      });
    });
    const pct = total ? Math.round(covered / total * 100) : 0;
    return `
      <div style="background:${pBgs[p]};border:1px solid ${pColors[p]};border-radius:var(--radius-sm);padding:16px;opacity:${p==='D'?.7:1}">
        <div style="font-size:1.6rem;font-weight:900;color:${pColors[p]};line-height:1;">${pct}%</div>
        <div style="font-size:.72rem;font-weight:700;color:${pColors[p]};margin-top:2px;margin-bottom:8px;">${pLabels[p]}</div>
        <div class="progress-bar" style="margin-bottom:6px;height:6px;">
          <div class="progress-fill" style="width:${pct}%;background:${pColors[p]};"></div>
        </div>
        <div style="font-size:.68rem;color:var(--muted);">${covered}/${total} covered · ${mastered} mastered</div>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────────────────────────────
// STUDY TIME STATS
// ──────────────────────────────────────────────────────────────────────
function initStudyTimeStats() {
  const logs        = S.getStudyLogs();
  const todayLog    = S.getLogForDate(today());
  const totalToday  = todayLog ? todayLog.total : 0;

  document.getElementById('statTodayHours').textContent = totalToday.toFixed(1) + 'h';
  if (todayLog && todayLog.total > 0) {
    document.getElementById('statTodayBreakdown').innerHTML =
      `P:${todayLog.phy||0}h C:${todayLog.chem||0}h M:${todayLog.math||0}h`;
  } else {
    document.getElementById('statTodayBreakdown').textContent = 'No study logged yet';
  }

  let allTime = 0, weekTotal = 0;
  const now = new Date();
  logs.forEach(l => {
    allTime += (l.total || 0);
    if ((now - new Date(l.date)) / 86400000 <= 7) weekTotal += (l.total || 0);
  });

  document.getElementById('statWeekHours').textContent  = weekTotal.toFixed(1) + 'h';
  document.getElementById('statTotalHours').textContent = allTime.toFixed(1) + 'h';

  // streak
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d  = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const l  = logs.find(x => x.date === ds);
    if (l && l.total > 0) streak++;
    else if (i > 0) break;
  }
  document.getElementById('statStreak').textContent = streak;
}

// ──────────────────────────────────────────────────────────────────────
// DAILY HOURS CHART (30 days bar)
// ──────────────────────────────────────────────────────────────────────
function initDailyHoursChart() {
  const logs = S.getLast30Logs();
  const ctx  = document.getElementById('dailyHoursChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: logs.map(l => {
        const d = new Date(l.date);
        return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
      }),
      datasets: [{
        label: 'Study Hours',
        data: logs.map(l => +(l.total || 0).toFixed(1)),
        backgroundColor: logs.map(l => {
          if (!l.total) return 'rgba(255,255,255,0.06)';
          if (l.aiRating >= 80) return 'rgba(16,217,138,.7)';
          if (l.aiRating >= 60) return 'rgba(234,179,8,.7)';
          if (l.aiRating >= 30) return 'rgba(251,146,60,.7)';
          if (l.aiRating != null) return 'rgba(240,82,82,.7)';
          return 'rgba(91,141,238,.65)';
        }),
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display:false },
        tooltip: { callbacks: {
          label: ctx => ` ${ctx.parsed.y}h studied`
        }}
      },
      scales: {
        y: {
          min: 0,
          ticks: { callback: v => v+'h', font:{size:10} },
          grid: { color:'rgba(255,255,255,0.04)' }
        },
        x: { ticks: { maxRotation: 45, font:{size:8}, maxTicksLimit:10 } }
      }
    }
  });
}

// ──────────────────────────────────────────────────────────────────────
// WEEKLY TREND CHART (12-week)
// ──────────────────────────────────────────────────────────────────────
function initWeeklyTrendChart() {
  const logs = S.getStudyLogs();
  const weeks = [];

  for (let w = 11; w >= 0; w--) {
    const end   = new Date(); end.setDate(end.getDate() - w * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const label = start.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    let total = 0;
    logs.forEach(l => {
      const d = new Date(l.date);
      if (d >= start && d <= end) total += (l.total || 0);
    });
    weeks.push({ label, total: +total.toFixed(1) });
  }

  const avg = weeks.reduce((s,w)=>s+w.total,0) / weeks.length;
  const ctx = document.getElementById('weeklyTrendChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeks.map(w => w.label),
      datasets: [
        {
          label: 'Weekly Hours',
          data: weeks.map(w => w.total),
          borderColor: '#5b8dee',
          backgroundColor: 'rgba(91,141,238,.08)',
          pointBackgroundColor: weeks.map(w => w.total >= avg ? '#22c55e' : '#fb923c'),
          pointRadius: 5, pointHoverRadius: 8,
          tension: 0.4, fill: true, borderWidth: 2,
        },
        {
          label: 'Average',
          data: weeks.map(() => +avg.toFixed(1)),
          borderColor: 'rgba(139,92,246,.5)',
          borderDash: [5,4], borderWidth: 1.5,
          pointRadius: 0, fill: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display:false },
        tooltip: { callbacks: { label: c => ` ${c.parsed.y}h` } }
      },
      scales: {
        y: { min:0, ticks:{callback:v=>v+'h', font:{size:10}}, grid:{color:'rgba(255,255,255,0.04)'} },
        x: { ticks:{ font:{size:9} } }
      }
    }
  });
}

// ──────────────────────────────────────────────────────────────────────
// SUBJECT TIME BREAKDOWN (all-time)
// ──────────────────────────────────────────────────────────────────────
function initSubjectTimeBreakdown() {
  const logs = S.getStudyLogs();
  const totals = { phy:0, chem:0, math:0, eng:0, pe:0 };

  logs.forEach(l => {
    Object.keys(totals).forEach(k => { totals[k] += (l[k] || 0); });
  });

  const grand = Object.values(totals).reduce((a,b)=>a+b, 0);
  const el = document.getElementById('subjectTimeBreakdown');

  const SUBJECTS = [
    { k:'phy',  name:'⚡ Physics',     color:'var(--phy)'  },
    { k:'chem', name:'🧪 Chemistry',   color:'var(--chem)' },
    { k:'math', name:'∑ Mathematics',  color:'var(--math)' },
    { k:'eng',  name:'📖 English',     color:'var(--eng)'  },
    { k:'pe',   name:'🏃 Phys. Ed',    color:'var(--pe)'   },
  ];

  if (!grand) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;padding:20px 0;text-align:center;">No study hours logged yet</div>';
    return;
  }

  el.innerHTML = SUBJECTS.map(s => {
    const h   = totals[s.k] || 0;
    const pct = grand ? Math.round(h / grand * 100) : 0;
    return `
      <div class="subtime-row">
        <div style="width:100px;font-size:.78rem;font-weight:600;color:${s.color};">${s.name}</div>
        <div class="subtime-bar-track">
          <div class="subtime-bar-fill" style="width:${pct}%;background:${s.color};"></div>
        </div>
        <div style="width:48px;text-align:right;font-size:.75rem;font-weight:700;color:${s.color};">${h.toFixed(1)}h</div>
        <div style="width:32px;text-align:right;font-size:.68rem;color:var(--muted);">${pct}%</div>
      </div>`;
  }).join('');

  // Insights
  const sortedSubs = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  const topSub = SUBJECTS.find(s => s.k === sortedSubs[0][0]);
  const lowSub = SUBJECTS.find(s => s.k === sortedSubs[sortedSubs.length-1][0]);
  const avgPerDay = grand / Math.max(S.getStudyLogs().filter(l=>l.total>0).length, 1);

  const insEl = document.getElementById('studyInsights');
  insEl.innerHTML = [
    `<span class="insight-pill">🏆 Most: ${topSub?.name || '—'}</span>`,
    `<span class="insight-pill">📊 Avg/day: ${avgPerDay.toFixed(1)}h</span>`,
    `<span class="insight-pill">📚 Total: ${grand.toFixed(1)}h</span>`,
    grand > 0 && sortedSubs[sortedSubs.length-1][1] < grand * 0.1
      ? `<span class="insight-pill" style="background:rgba(240,82,82,.1);border-color:rgba(240,82,82,.3);color:var(--red);">⚠️ Low: ${lowSub?.name}</span>`
      : ''
  ].join('');
}

// ──────────────────────────────────────────────────────────────────────
// HEATMAP
// ──────────────────────────────────────────────────────────────────────
function initHeatmap() {
  const logs = S.getLast30Logs();
  const el   = document.getElementById('heatmap');

  el.innerHTML = logs.map(l => {
    const h  = Math.min(Math.round(l.total), 10);
    const ds = new Date(l.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    let cellStyle = '', ratingTitle = '';

    if (l.aiRating != null && l.total > 0) {
      const r = l.aiRating;
      let bg, border, glow;
      if      (r < 30) { bg='rgba(240,82,82,.75)';  border='var(--red)';    glow='rgba(240,82,82,.4)'; }
      else if (r < 60) { bg='rgba(251,146,60,.75)';  border='var(--orange)'; glow='rgba(251,146,60,.4)'; }
      else if (r < 80) { bg='rgba(234,179,8,.75)';   border='#eab308';       glow='rgba(234,179,8,.4)'; }
      else             { bg='rgba(16,217,138,.75)';   border='var(--green)';  glow='rgba(16,217,138,.4)'; }
      const opacity = Math.min(0.5 + (l.total/12)*0.5, 1).toFixed(2);
      cellStyle = `background:${bg};opacity:${opacity};box-shadow:0 0 6px ${glow};outline:1.5px solid ${border};outline-offset:1px;`;
      ratingTitle = ` | AI: ${r}/100`;
    }

    return `<div class="heatmap-cell" data-h="${l.aiRating != null ? 'rated' : h}"
      style="${cellStyle}"
      title="${ds}: ${l.total.toFixed(1)}h${ratingTitle}"></div>`;
  }).join('');

  // Summary
  const activeDays = logs.filter(l=>l.total>0).length;
  const totalH     = logs.reduce((s,l)=>s+(l.total||0),0);
  const avgH       = activeDays ? (totalH / activeDays).toFixed(1) : 0;
  document.getElementById('heatmapSummary').innerHTML =
    `<strong>${activeDays}/30</strong> active days · <strong>${totalH.toFixed(1)}h</strong> total · <strong>${avgH}h</strong> avg per active day`;
}

// ──────────────────────────────────────────────────────────────────────
// MOMENTUM
// ──────────────────────────────────────────────────────────────────────
async function runMomentumAnalysis() {
  const btn = document.getElementById('analyzeMomBtn');
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  btn.disabled  = true;
  try {
    const result = await AI.analyzeMomentum();
    renderMomentum(result);
    toast('AI momentum analysis complete!', 'success');
  } catch(e) {
    toast(e.message, 'error');
  }
  btn.innerHTML = '🤖 Analyze';
  btn.disabled  = false;
}

function renderMomentum(r) {
  if (!r) return;
  const el = document.getElementById('momentumDisplay');
  const scoreColors = { A:'var(--green)', B:'var(--blue)', C:'var(--amber)', D:'var(--orange)', F:'var(--red)' };
  const c = scoreColors[r.grade?.charAt(0)] || 'var(--blue)';

  el.innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:14px;">
      <div style="text-align:center;background:var(--bg2);border:2px solid ${c};border-radius:14px;padding:14px 18px;flex-shrink:0;">
        <div style="font-size:2.2rem;font-weight:900;color:${c};line-height:1;">${r.score}/10</div>
        <div style="font-size:.75rem;font-weight:700;color:${c};margin-top:2px;">${r.grade}</div>
        <div style="font-size:.6rem;color:var(--muted);margin-top:2px;">${r.momentum}</div>
      </div>
      <div style="flex:1;">
        <p style="font-size:.83rem;line-height:1.55;margin-bottom:10px;">${r.analysis}</p>
        <div style="font-size:.78rem;color:var(--green);margin-bottom:4px;">✅ ${(r.strengths||[]).join(' · ')}</div>
        <div style="font-size:.78rem;color:var(--red);">⚠️ ${(r.weaknesses||[]).join(' · ')}</div>
      </div>
    </div>
    <div style="background:var(--bg2);border-radius:8px;padding:10px 14px;font-size:.81rem;margin-bottom:8px;line-height:1.55;">
      <strong>Recommendation:</strong> ${r.recommendation}
    </div>
    <div style="font-size:.78rem;color:var(--muted);">🎯 JEE Prediction: ${r.prediction}</div>
    <div style="font-size:.65rem;color:var(--muted);margin-top:6px;">Last analyzed: ${S.getMomentumDate()}</div>`;

  // also show cached if present
  const cached = S.getMomentum();
  if (cached && !r) renderMomentum(cached);
}

// ──────────────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof JEE_SYLLABUS === 'undefined') {
    const s = document.createElement('script');
    s.src   = 'assets/js/syllabus-data.js';
    s.onload = initAll;
    document.head.appendChild(s);
  } else {
    initAll();
  }

  // Show cached momentum if available
  const cached = S.getMomentum();
  if (cached) renderMomentum(cached);

  initApiStatus();
});

function initAll() {
  initSyllabusKPIs();
  initStatusChart();
  initSubjectBarChart();
  initPriorityCoverage();
  initStudyTimeStats();
  initDailyHoursChart();
  initWeeklyTrendChart();
  initSubjectTimeBreakdown();
  initHeatmap();
}

// ─── Test Analytics JS ─────────────────────────────────────────────
// Handles: mock score chart, score distribution, history table,
//          error book — all on test-analytics.html

let _activeTypeFilter = 'all';
let _activeErrFilter  = 'all';
let _mockChartInst    = null;

// ── Helpers ──────────────────────────────────────────────────────────
const GRADE_MAP = pct =>
  pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' :
  pct >= 60 ? 'B'  : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';

const GRADE_COLOR = pct =>
  pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';

const SUB_NAME  = k => ({phy:'Physics',chem:'Chemistry',math:'Mathematics',eng:'English',pe:'Phys. Ed'})[k] || k;
const SUB_COLOR = k => ({phy:'var(--phy)',chem:'var(--chem)',math:'var(--math)',eng:'var(--blue)',pe:'var(--green)'})[k] || '#888';

Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';

// ── Filter ────────────────────────────────────────────────────────────
function filteredScores() {
  const all = S.getMockScores();
  if (_activeTypeFilter === 'all') return all;
  return all.filter(s => (s.type || 'jee') === _activeTypeFilter);
}

function setTypeFilter(el, type) {
  _activeTypeFilter = type;
  document.querySelectorAll('#typeFilter .fchip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderMockChart();
  renderKPIs();
  renderDistribution();
}

function setErrFilter(el, sub) {
  _activeErrFilter = sub;
  document.querySelectorAll('#errSubFilter .fchip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderErrorBook();
}

// ── KPIs ──────────────────────────────────────────────────────────────
function renderKPIs() {
  const scores = S.getMockScores();
  const count  = scores.length;

  document.getElementById('kpiCount').textContent = count;
  document.getElementById('kpiCountSub').textContent = `${scores.filter(s=>(s.type||'jee')==='jee').length} JEE · ${scores.filter(s=>s.type==='cbse').length} CBSE`;

  if (!count) return;

  const pcts = scores.map(s => Math.round(s.score / s.max * 100));

  const avg  = pcts.reduce((a,b) => a+b, 0) / pcts.length;
  const best = Math.max(...pcts);
  const bestTest = scores[pcts.indexOf(best)];

  document.getElementById('kpiAvg').textContent = avg.toFixed(1) + '%';
  document.getElementById('kpiAvgSub').style.color = GRADE_COLOR(avg);
  document.getElementById('kpiAvgSub').textContent = 'Grade: ' + GRADE_MAP(avg);

  document.getElementById('kpiBest').textContent = best + '%';
  document.getElementById('kpiBestSub').textContent = bestTest?.testName?.slice(0,20) || 'All time high';

  // Trend: last-5 vs prev-5
  if (pcts.length >= 4) {
    const last5 = pcts.slice(-5);
    const prev5 = pcts.slice(-10, -5);
    if (prev5.length) {
      const l5avg = last5.reduce((a,b)=>a+b,0)/last5.length;
      const p5avg = prev5.reduce((a,b)=>a+b,0)/prev5.length;
      const diff  = l5avg - p5avg;
      const sign  = diff > 0 ? '+' : '';
      const cls   = diff > 0 ? 'trend-up' : diff < 0 ? 'trend-down' : 'trend-flat';
      const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
      document.getElementById('kpiTrend').innerHTML =
        `<span class="${cls}">${arrow}${sign}${diff.toFixed(1)}%</span>`;
      document.getElementById('kpiTrendSub').textContent = `${l5avg.toFixed(1)}% vs ${p5avg.toFixed(1)}% earlier`;
    } else {
      document.getElementById('kpiTrend').textContent = pcts.slice(-3).reduce((a,b)=>a+b,0)/Math.min(3,pcts.length) >= avg ? '↑' : '↓';
    }
  } else {
    document.getElementById('kpiTrend').textContent = 'N/A';
    document.getElementById('kpiTrendSub').textContent = 'Need ≥4 tests';
  }
}

// ── Score Chart ───────────────────────────────────────────────────────
function renderMockChart() {
  const scores = filteredScores().slice(-15);
  const ctx    = document.getElementById('mockChart').getContext('2d');

  if (_mockChartInst) { _mockChartInst.destroy(); _mockChartInst = null; }

  if (!scores.length) { ctx.clearRect(0, 0, 999, 999); return; }

  const pcts = scores.map(s => Math.round(s.score / s.max * 100));
  const avg  = pcts.reduce((a,b)=>a+b,0) / pcts.length;

  _mockChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.map(s => s.testName?.slice(0,10) || s.date),
      datasets: [
        {
          label: 'Score %',
          data: pcts,
          borderColor: '#5b8dee',
          backgroundColor: 'rgba(79,142,247,.08)',
          pointBackgroundColor: pcts.map(p => p >= 67 ? '#22c55e' : p >= 50 ? '#f59e0b' : '#ef4444'),
          pointRadius: 6, pointHoverRadius: 9,
          tension: 0.4, fill: true, borderWidth: 2,
        },
        {
          label: 'Average',
          data: pcts.map(() => Math.round(avg)),
          borderColor: 'rgba(139,92,246,.5)',
          borderDash: [5, 4], borderWidth: 1.5,
          pointRadius: 0, fill: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? ` ${ctx.parsed.y}% — ${GRADE_MAP(ctx.parsed.y)}` : ` Avg: ${ctx.parsed.y}%` } }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { maxRotation: 40, font: { size: 9 } } }
      }
    }
  });
}

// ── Score Distribution ────────────────────────────────────────────────
function renderDistribution() {
  const scores    = S.getMockScores();
  const el        = document.getElementById('scoreDistribution');
  const insightEl = document.getElementById('insightBox');

  if (!scores.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;padding:20px 0;text-align:center;">Log some test scores to see distribution</div>';
    insightEl.innerHTML = '';
    return;
  }

  const buckets = [
    { label: 'A+', min: 90, color: '#10d98a' },
    { label: 'A',  min: 80, color: '#22d3ee' },
    { label: 'B+', min: 70, color: '#5b8dee' },
    { label: 'B',  min: 60, color: '#8b5cf6' },
    { label: 'C',  min: 50, color: '#f59e0b' },
    { label: 'D',  min: 40, color: '#fb923c' },
    { label: 'F',  min: 0,  color: '#f05252' },
  ];

  const pcts   = scores.map(s => Math.round(s.score / s.max * 100));
  const counts = buckets.map(b => ({
    ...b,
    count: pcts.filter(p => {
      const next = buckets[buckets.indexOf(b)-1];
      return p >= b.min && (next ? p < next.min : true);
    }).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  el.innerHTML = counts.map(c => `
    <div class="dist-bar-wrap">
      <div class="dist-bar-label" style="color:${c.color};font-weight:800;">${c.label}</div>
      <div class="dist-bar-track"><div class="dist-bar-fill" style="width:${Math.round(c.count/maxCount*100)}%;background:${c.color};"></div></div>
      <div class="dist-bar-count">${c.count}</div>
    </div>`).join('');

  const aboveAvg = pcts.filter(p => p >= 60).length;
  const streak = (() => { let s=0; for(let i=pcts.length-1;i>=0;i--){if(pcts[i]>=60)s++;else break;} return s; })();
  insightEl.innerHTML = `<div class="insight-box">
    📊 <strong>${aboveAvg}/${scores.length}</strong> tests scored 60%+
    ${streak >= 2 ? ` · 🔥 <strong>${streak}-test streak</strong> above 60%` : ''}
    · Best grade: <strong style="color:${GRADE_COLOR(Math.max(...pcts))}">${GRADE_MAP(Math.max(...pcts))}</strong>
  </div>`;
}

// ── History Table ─────────────────────────────────────────────────────
function renderHistoryTable() {
  const sortMode = document.getElementById('histSort')?.value || 'newest';
  let scores = S.getMockScores().slice();

  if (sortMode === 'newest')  scores.sort((a,b) => b.date.localeCompare(a.date));
  if (sortMode === 'oldest')  scores.sort((a,b) => a.date.localeCompare(b.date));
  if (sortMode === 'highest') scores.sort((a,b) => b.score/b.max - a.score/a.max);
  if (sortMode === 'lowest')  scores.sort((a,b) => a.score/a.max - b.score/b.max);

  const el  = document.getElementById('mockTable');
  const cnt = document.getElementById('histCount');
  cnt.textContent = `${scores.length} test${scores.length !== 1 ? 's' : ''}`;

  if (!scores.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;padding:20px 0;">No test scores yet. Click <strong>📅 Log Past Test</strong> on the JEE Tests page to add results.</div>';
    return;
  }

  el.innerHTML = `<table class="hist-table">
    <thead><tr>
      <th>Test</th><th>Type</th><th>Date</th><th>Score</th><th>%</th><th>Grade</th><th>Wrong (P·C·M)</th><th>Rank</th><th></th>
    </tr></thead>
    <tbody>
      ${scores.map(s => {
        const pct   = Math.round(s.score / s.max * 100);
        const color = GRADE_COLOR(pct);
        const grade = GRADE_MAP(pct);
        const typeC = (s.type || 'jee') === 'jee' ? 'badge-blue' : 'badge-green';
        const wc    = s.wrongCounts || {};
        const hasWrong = wc.phy != null || wc.chem != null || wc.math != null;
        const notesHtml = s.wrongNotes
          ? ` <abbr title="${s.wrongNotes.replace(/"/g,"'").slice(0,300)}" style="cursor:help;text-decoration:none;font-size:.8rem;">📝</abbr>`
          : '';
        const wrongCell = hasWrong
          ? `<span style="color:var(--phy);font-weight:700;">${wc.phy||0}</span><span style="color:var(--muted);">·</span><span style="color:var(--chem);font-weight:700;">${wc.chem||0}</span><span style="color:var(--muted);">·</span><span style="color:var(--math);font-weight:700;">${wc.math||0}</span>${notesHtml}`
          : '<span style="color:var(--muted);">—</span>';
        
        const rankCell = s.ranks?.centerPercentile != null
          ? `<span style="font-weight:700;color:var(--accent);">${s.ranks.centerPercentile}%</span>`
          : (s.overall?.classAverage != null ? `<span style="color:var(--muted);font-size:.75rem;">Avg: ${s.overall.classAverage}</span>` : '<span style="color:var(--muted);">—</span>');
        
        let detailRow = '';
        if (s.ranks || s.overall || s.subjectDetails) {
          const parts = [];
          if (s.ranks?.centerRank) parts.push(`Center: ${s.ranks.centerRank} (${s.ranks.centerPercentile}%ile)`);
          if (s.ranks?.batchRank) parts.push(`Batch: ${s.ranks.batchRank}`);
          if (s.overall?.classAverage != null) parts.push(`Class Avg: ${s.overall.classAverage}`);
          if (s.overall?.correct != null) parts.push(`${s.overall.correct}✓ ${s.overall.incorrect}✗ ${s.overall.unattempted}○`);
          if (s.subjectDetails) {
            const sd = s.subjectDetails;
            if (sd.physics?.score != null) parts.push(`Phy: ${sd.physics.score}`);
            if (sd.chemistry?.score != null) parts.push(`Chem: ${sd.chemistry.score}`);
            if (sd.mathematics?.score != null) parts.push(`Math: ${sd.mathematics.score}`);
          }
          if (parts.length) {
            detailRow = `<tr class="detail-row"><td colspan="9" style="padding:4px 12px 8px;font-size:.72rem;color:var(--muted);border-top:none;">${parts.join(' · ')}</td></tr>`;
          }
        }
        
        return `<tr style="cursor:pointer;" onclick="this.nextElementSibling?.classList.toggle('hide')">
          <td style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(s.testName||'').replace(/"/g,"'")}">${s.testName || '—'}</td>
          <td><span class="badge ${typeC}">${(s.type||'jee').toUpperCase()}</span></td>
          <td style="color:var(--muted);font-size:.78rem;white-space:nowrap;">${s.date}</td>
          <td style="font-weight:700;font-family:'JetBrains Mono',monospace;">${s.score}/${s.max}</td>
          <td style="color:${color};font-weight:800;">${pct}%</td>
          <td><span style="font-size:.85rem;font-weight:800;color:${color};">${grade}</span></td>
          <td style="font-size:.78rem;">${wrongCell}</td>
          <td style="font-size:.78rem;">${rankCell}</td>
          <td style="text-align:right;"><button class="btn-icon" style="color:var(--muted);font-size:.7rem;" onclick="event.stopPropagation();deleteMockScore('${s.id}')">✕</button></td>
        </tr>${detailRow ? detailRow.replace('class="detail-row"', 'class="detail-row hide"') : ''}`;
      }).join('')}
    </tbody>
  </table>
  <style>.detail-row.hide{display:none;}.detail-row{background:rgba(255,255,255,.02);}</style>`;
}

window.deleteMockScore = function(id) {
  if(!confirm('Delete this test score from your history?')) return;
  S.deleteMockScore(id);
  renderTrendChart();
  renderDistribution();
  renderHistoryTable();
  toast('Test score deleted.', 'info');
};

// ── Error Book ────────────────────────────────────────────────────────
function openErrorModal() {
  document.getElementById('errTopic').value = '';
  document.getElementById('errDesc').value  = '';
  document.getElementById('errorModal').classList.add('open');
}

function saveMistake() {
  const sub   = document.getElementById('errSub').value;
  const topic = document.getElementById('errTopic').value.trim();
  const desc  = document.getElementById('errDesc').value.trim();
  if (!topic || !desc) { toast('Please fill in both topic and description.', 'error'); return; }
  S.addError({ subject: sub, topic, desc });
  document.getElementById('errorModal').classList.remove('open');
  renderErrorBook();
  toast('Mistake logged! Review it often.', 'success');
}

function deleteMistake(id) {
  if (!confirm('Delete this mistake entry?')) return;
  S.deleteError(id);
  renderErrorBook();
  toast('Mistake deleted.', 'info');
}

function renderErrorBook() {
  let errs = S.getErrors().slice().reverse();
  if (_activeErrFilter !== 'all') errs = errs.filter(e => e.subject === _activeErrFilter);
  const el = document.getElementById('errorBookList');

  if (!errs.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;padding:16px 0;">No mistakes here. Either you\'re crushing it, or log some!</div>';
    return;
  }

  el.innerHTML = errs.map(e => `
    <div class="err-card">
      <button class="btn-icon" style="position:absolute;top:8px;right:8px;font-size:.7rem;padding:4px 8px;" onclick="deleteMistake('${e.id}')">🗑️</button>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-right:36px;">
        <span class="badge" style="background:${SUB_COLOR(e.subject)};color:#fff;opacity:.9;">${SUB_NAME(e.subject)}</span>
        <span style="font-weight:700;font-size:.88rem;">${e.topic}</span>
        <span style="font-size:.65rem;color:var(--muted);margin-left:auto;">${e.date}</span>
      </div>
      <div style="font-size:.81rem;color:var(--text2);line-height:1.6;white-space:pre-wrap;">${e.desc}</div>
    </div>`).join('');
}

// ── Init All ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  renderKPIs();
  renderMockChart();
  renderDistribution();
  renderHistoryTable();
  renderErrorBook();

  document.getElementById('errorModal').addEventListener('click', e => {
    if (e.target === document.getElementById('errorModal'))
      document.getElementById('errorModal').classList.remove('open');
  });
});

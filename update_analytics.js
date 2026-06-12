const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public/analytics.html');
const jsPath = path.join(__dirname, 'public/assets/js/analytics.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const newMainContent = `
  <div class="page-header">
    <h1>📊 Analytics & Score Card</h1>
    <p>Your syllabus coverage, test scores, and error book</p>
  </div>

  <!-- STATS -->
  <div class="grid-4" style="margin-bottom:20px;">
    <div class="stat-card" style="--accent:var(--green)">
      <div class="stat-value" id="overallScore">0%</div>
      <div class="stat-label">Syllabus Readiness</div>
      <div class="stat-sub" id="overallChaps">0/0 Chapters Covered</div>
    </div>
    <div class="stat-card" style="--accent:var(--phy)">
      <div class="stat-value" id="phyScore">0%</div>
      <div class="stat-label">Physics Readiness</div>
      <div class="stat-sub" id="phyChaps">0/0 Covered</div>
    </div>
    <div class="stat-card" style="--accent:var(--chem)">
      <div class="stat-value" id="chemScore">0%</div>
      <div class="stat-label">Chemistry Readiness</div>
      <div class="stat-sub" id="chemChaps">0/0 Covered</div>
    </div>
    <div class="stat-card" style="--accent:var(--math)">
      <div class="stat-value" id="mathScore">0%</div>
      <div class="stat-label">Math Readiness</div>
      <div class="stat-sub" id="mathChaps">0/0 Covered</div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px;margin-bottom:20px;">
    <!-- SYLLABUS STATUS -->
    <div class="card">
      <div class="card-title">📚 CHAPTER STATUS BREAKDOWN</div>
      <div style="position:relative; width:100%; max-width:280px; height:240px; margin:0 auto;">
        <canvas id="syllabusStatusChart"></canvas>
      </div>
    </div>

    <!-- SUBJECT READINESS -->
    <div class="card">
      <div class="card-title">📈 SUBJECT READINESS</div>
      <div style="position:relative; width:100%; height:240px; margin:0 auto;">
        <canvas id="subjectBarChart"></canvas>
      </div>
    </div>
  </div>

  <!-- MOCK SCORES & TESTS -->
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div class="card-title" style="margin-bottom:0;">🎯 MOCK TEST SCORES</div>
      <div class="stat-sub">
        <strong style="color:var(--text);font-size:.9rem" id="mockAvg">–</strong> Avg | 
        <span id="mockCount">0</span> Tests
      </div>
    </div>
    <canvas id="mockChart" height="120" style="margin-top:10px;"></canvas>
  </div>

  <!-- MOCK TEST TABLE -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title">📋 TEST HISTORY</div>
    <div id="mockTable"></div>
  </div>

  <!-- ERROR BOOK -->
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:0">📒 ERROR BOOK (Mistake Log)</div>
      <button class="btn btn-primary btn-sm" onclick="openErrorModal()">+ Log Mistake</button>
    </div>
    <div id="errorBookList"><div style="color:var(--muted);font-size:.83rem;">No mistakes logged yet. Good job (or take more tests)!</div></div>
  </div>
`;

htmlContent = htmlContent.replace(/<div class="page-header">[\s\S]*?<!-- ERROR BOOK MODAL -->/, newMainContent + '\n</main>\n\n<!-- ERROR BOOK MODAL -->');
fs.writeFileSync(htmlPath, htmlContent);

const newJsContent = `const CHART_DEFAULTS = {
  color: '#94a3b8',
  borderColor: '#1e1e40',
  gridColor: 'rgba(255,255,255,0.04)',
};
Chart.defaults.color = CHART_DEFAULTS.color;
Chart.defaults.borderColor = CHART_DEFAULTS.gridColor;

const PCM = [
  { k:'phy',  name:'Physics',     short:'P', color:'#f59e0b', css:'var(--phy)'  },
  { k:'chem', name:'Chemistry',   short:'C', color:'#f05252', css:'var(--chem)' },
  { k:'math', name:'Mathematics', short:'M', color:'#8b5cf6', css:'var(--math)' },
];
const STATUS_SCORE = { todo:0, theory:1, theory_pyq:1.75, pyqs:2.5, mastered:4 };

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
      const d = sylData[ch.id] || {};
      const st = d.status || 'todo';
      statusCounts[st]++;
      if (st === 'mastered' || st === 'pyqs' || st === 'theory_pyq') subCov++;
      subScore += STATUS_SCORE[st] || 0;
    });

    subStats[sub.k] = {
      covered: subCov, total: subTot,
      readyPct: subTot ? Math.round(subScore / (subTot * 4) * 100) : 0
    };

    totalChaps += subTot;
    coveredChaps += subCov;
    overallScore += subScore;
    maxScore += subTot * 4;
  });

  const overallReadyPct = maxScore ? Math.round(overallScore / maxScore * 100) : 0;
  
  return { totalChaps, coveredChaps, overallReadyPct, subStats, statusCounts };
}

function initStats() {
  const stats = calculateSyllabusStats();
  if (stats) {
    document.getElementById('overallScore').textContent = stats.overallReadyPct + '%';
    document.getElementById('overallChaps').textContent = \`\${stats.coveredChaps}/\${stats.totalChaps} Chapters Covered\`;
    
    document.getElementById('phyScore').textContent = stats.subStats.phy.readyPct + '%';
    document.getElementById('phyChaps').textContent = \`\${stats.subStats.phy.covered}/\${stats.subStats.phy.total} Covered\`;

    document.getElementById('chemScore').textContent = stats.subStats.chem.readyPct + '%';
    document.getElementById('chemChaps').textContent = \`\${stats.subStats.chem.covered}/\${stats.subStats.chem.total} Covered\`;

    document.getElementById('mathScore').textContent = stats.subStats.math.readyPct + '%';
    document.getElementById('mathChaps').textContent = \`\${stats.subStats.math.covered}/\${stats.subStats.math.total} Covered\`;
  }

  const scores = S.getMockScores();
  if (scores.length) {
    const avg2 = scores.reduce((s,m)=>s+(m.score/m.max*100),0)/scores.length;
    document.getElementById('mockAvg').textContent = avg2.toFixed(1)+'%';
    document.getElementById('mockCount').textContent = scores.length;
  }
}

function initStatusChart() {
  const stats = calculateSyllabusStats();
  if (!stats) return;
  const ctx = document.getElementById('syllabusStatusChart').getContext('2d');
  
  const sc = stats.statusCounts;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Mastered', 'PYQs Done', 'Theory+PYQ', 'Theory', 'To Do'],
      datasets: [{
        data: [sc.mastered, sc.pyqs, sc.theory_pyq, sc.theory, sc.todo],
        backgroundColor: [
          'rgba(16, 217, 138, 0.8)',   // green
          'rgba(91, 141, 238, 0.8)',   // blue
          'rgba(251, 146, 60, 0.8)',   // orange
          'rgba(251, 191, 36, 0.8)',   // amber
          'rgba(148, 163, 184, 0.4)'   // muted
        ],
        borderColor: '#111128',
        borderWidth: 2,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position:'bottom', labels:{ padding:12, font:{size:11} } }
      },
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
      labels: ['Physics', 'Chemistry', 'Mathematics'],
      datasets: [{
        label: 'Readiness %',
        data: [stats.subStats.phy.readyPct, stats.subStats.chem.readyPct, stats.subStats.math.readyPct],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0, max: 100,
          ticks: { callback: v => v+'%' }
        }
      }
    }
  });
}

function initMockChart() {
  const scores = S.getMockScores().slice(-15);
  const ctx = document.getElementById('mockChart').getContext('2d');
  if (!scores.length) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.map(s => s.testName?.slice(0,12)||s.date),
      datasets: [{
        label: 'Score %',
        data: scores.map(s => Math.round(s.score/s.max*100)),
        borderColor: '#4f8ef7',
        backgroundColor: 'rgba(79,142,247,.1)',
        pointBackgroundColor: scores.map(s => {
          const p = s.score/s.max;
          return p>=0.67?'#22c55e':p>=0.5?'#f59e0b':'#ef4444';
        }),
        pointRadius: 5,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend:{ display:false } },
      scales: {
        y: { min:0, max:100, title:{ display:true, text:'Score %' }, ticks:{ callback:v=>v+'%' } },
        x: { ticks:{ maxRotation:45, font:{size:9} } }
      }
    }
  });
}

function initMockTable() {
  const scores = S.getMockScores().slice().reverse();
  const el = document.getElementById('mockTable');
  if (!scores.length) { el.innerHTML='<div style="color:var(--muted);font-size:.83rem;">No test scores logged yet.</div>'; return; }
  el.innerHTML = \`<table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="font-size:.72rem;color:var(--muted);text-transform:uppercase;">
        <th style="text-align:left;padding:6px 8px;">Test</th>
        <th style="text-align:center;padding:6px 8px;">Type</th>
        <th style="text-align:center;padding:6px 8px;">Date</th>
        <th style="text-align:center;padding:6px 8px;">Score</th>
        <th style="text-align:center;padding:6px 8px;">%</th>
        <th style="text-align:center;padding:6px 8px;">Grade</th>
      </tr>
    </thead>
    <tbody>
      \${scores.map(s => {
        const pct = Math.round(s.score/s.max*100);
        const color = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
        const grade = pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':pct>=50?'C':pct>=40?'D':'F';
        return \`<tr style="border-top:1px solid var(--border);font-size:.83rem;">
          <td style="padding:8px;">\${s.testName||'–'}</td>
          <td style="text-align:center;"><span class="badge \${s.type==='jee'?'badge-blue':'badge-green'}">\${(s.type||'jee').toUpperCase()}</span></td>
          <td style="text-align:center;color:var(--muted)">\${s.date}</td>
          <td style="text-align:center;font-weight:700">\${s.score}/\${s.max}</td>
          <td style="text-align:center;color:\${color};font-weight:700">\${pct}%</td>
          <td style="text-align:center;color:\${color};font-weight:700">\${grade}</td>
        </tr>\`;
      }).join('')}
    </tbody>
  </table>\`;
}

function openErrorModal() {
  document.getElementById('errTopic').value = '';
  document.getElementById('errDesc').value = '';
  document.getElementById('errorModal').classList.add('open');
}

function saveMistake() {
  const sub = document.getElementById('errSub').value;
  const topic = document.getElementById('errTopic').value.trim();
  const desc = document.getElementById('errDesc').value.trim();
  if (!topic || !desc) return toast('Please fill in both topic and description.', 'error');

  S.addError({ subject: sub, topic, desc });
  document.getElementById('errorModal').classList.remove('open');
  initErrorBook();
  toast('Mistake logged! Review it often.', 'success');
}

function deleteMistake(id) {
  if (!confirm('Are you sure you want to delete this mistake?')) return;
  S.deleteError(id);
  initErrorBook();
  toast('Mistake deleted.', 'info');
}

function initErrorBook() {
  const errs = S.getErrors().slice().reverse();
  const el = document.getElementById('errorBookList');
  if (!errs.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;">No mistakes logged yet. Good job (or take more tests)!</div>';
    return;
  }
  
  const subName = k => ({ phy:'Physics', chem:'Chemistry', math:'Mathematics', eng:'English', pe:'Phys. Ed' })[k] || k;
  const subColor = k => ({ phy:'var(--phy)', chem:'var(--chem)', math:'var(--math)', eng:'var(--blue)', pe:'var(--green)' })[k] || '#888';

  el.innerHTML = errs.map(e => \`
    <div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;position:relative;">
      <button class="btn-icon" style="position:absolute;top:8px;right:8px;font-size:.7rem;padding:4px 8px;" onclick="deleteMistake('\${e.id}')">🗑️</button>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span class="badge" style="background:\${subColor(e.subject)};color:#fff;">\${subName(e.subject)}</span>
        <span style="font-weight:700;font-size:.85rem;">\${e.topic}</span>
        <span style="font-size:.65rem;color:var(--muted);">\${e.date}</span>
      </div>
      <div style="font-size:.8rem;color:var(--text2);line-height:1.5;white-space:pre-wrap;">\${e.desc}</div>
    </div>
  \`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof JEE_SYLLABUS === 'undefined') {
    // If not loaded on the page, load it dynamically (but in analytics it should be loaded)
    const script = document.createElement('script');
    script.src = 'assets/js/syllabus-data.js';
    script.onload = initAll;
    document.head.appendChild(script);
  } else {
    initAll();
  }
});

function initAll() {
  initStats();
  initStatusChart();
  initSubjectBarChart();
  initMockChart();
  initMockTable();
  initErrorBook();
}
`;

fs.writeFileSync(jsPath, newJsContent);
console.log('Analytics refactored successfully.');

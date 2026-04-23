const CHART_DEFAULTS = {
  color: '#94a3b8',
  borderColor: '#1e1e40',
  gridColor: 'rgba(255,255,255,0.04)',
};
Chart.defaults.color = CHART_DEFAULTS.color;
Chart.defaults.borderColor = CHART_DEFAULTS.gridColor;

function initStats() {
  const logs = S.getLast30Logs();
  const total = logs.reduce((s,l)=>s+(l.total||0),0);
  const avg = total / 30;
  let best = logs.reduce((b,l)=>(l.total||0)>b.total?l:b, {total:0,date:''});

  document.getElementById('avgDaily').textContent = avg.toFixed(1)+'h';
  document.getElementById('totalHours').textContent = total.toFixed(0)+'h';
  if (best.date) {
    document.getElementById('bestDay').textContent = best.total.toFixed(1)+'h';
    document.getElementById('bestDayDate').textContent = formatDate(best.date);
  }

  const scores = S.getMockScores();
  if (scores.length) {
    const avg2 = scores.reduce((s,m)=>s+(m.score/m.max*100),0)/scores.length;
    document.getElementById('mockAvg').textContent = avg2.toFixed(1)+'%';
    document.getElementById('mockCount').textContent = `${scores.length} tests taken`;
  }
}

function initHeatmap() {
  const logs = S.getLast30Logs();
  const hm = document.getElementById('bigHeatmap');
  const labels = document.getElementById('heatmapLabels');
  hm.innerHTML = '';
  labels.innerHTML = '';
  logs.forEach(l => {
    const h = Math.min(Math.round(l.total), 10);
    const ds = new Date(l.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.setAttribute('data-h', h);
    cell.style.height = '28px';
    cell.title = `${ds}: ${l.total.toFixed(1)}h`;
    hm.appendChild(cell);

    const lbl = document.createElement('div');
    lbl.className = 'heatmap-label';
    lbl.textContent = new Date(l.date).getDate();
    labels.appendChild(lbl);
  });
}

function initSubjectPie() {
  const logs = S.getLast30Logs();
  const totals = { Physics: 0, Chemistry: 0, Mathematics: 0, English: 0, 'Phys. Ed': 0 };
  logs.forEach(l => {
    totals['Physics'] += l.phy||0;
    totals['Chemistry'] += l.chem||0;
    totals['Mathematics'] += l.math||0;
    totals['English'] += l.eng||0;
    totals['Phys. Ed'] += l.pe||0;
  });
  const ctx = document.getElementById('subjectPieChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: ['rgba(245,158,11,.8)','rgba(239,68,68,.8)','rgba(139,92,246,.8)','rgba(6,182,212,.8)','rgba(34,197,94,.8)'],
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
      cutout: '65%',
    }
  });
}

function initDailyChart() {
  const logs = S.getLast30Logs();
  const ctx = document.getElementById('dailyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: logs.map(l => new Date(l.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
      datasets: [
        { label:'Physics',    data: logs.map(l=>l.phy||0),  backgroundColor:'rgba(245,158,11,.7)', stack:'s' },
        { label:'Chemistry',  data: logs.map(l=>l.chem||0), backgroundColor:'rgba(239,68,68,.7)',  stack:'s' },
        { label:'Math',       data: logs.map(l=>l.math||0), backgroundColor:'rgba(139,92,246,.7)', stack:'s' },
        { label:'English',    data: logs.map(l=>l.eng||0),  backgroundColor:'rgba(6,182,212,.7)',  stack:'s' },
        { label:'PE',         data: logs.map(l=>l.pe||0),   backgroundColor:'rgba(34,197,94,.7)',  stack:'s' },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend:{ position:'top', labels:{ padding:10, font:{size:10} } } },
      scales: {
        x: { stacked:true, ticks:{ maxRotation:45, font:{size:9} } },
        y: { stacked:true, title:{ display:true, text:'Hours' } },
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
  el.innerHTML = `<table style="width:100%;border-collapse:collapse;">
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
      ${scores.map(s => {
        const pct = Math.round(s.score/s.max*100);
        const color = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
        const grade = pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':pct>=50?'C':pct>=40?'D':'F';
        return `<tr style="border-top:1px solid var(--border);font-size:.83rem;">
          <td style="padding:8px;">${s.testName||'–'}</td>
          <td style="text-align:center;"><span class="badge ${s.type==='jee'?'badge-blue':'badge-green'}">${(s.type||'jee').toUpperCase()}</span></td>
          <td style="text-align:center;color:var(--muted)">${s.date}</td>
          <td style="text-align:center;font-weight:700">${s.score}/${s.max}</td>
          <td style="text-align:center;color:${color};font-weight:700">${pct}%</td>
          <td style="text-align:center;color:${color};font-weight:700">${grade}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
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
  
  el.innerHTML = errs.map(e => `
    <div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;position:relative;">
      <button class="btn-icon" style="position:absolute;top:8px;right:8px;font-size:.7rem;padding:4px 8px;" onclick="deleteMistake('${e.id}')">🗑️</button>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span class="badge" style="background:${subColor(e.subject)};color:#fff;">${subName(e.subject)}</span>
        <span style="font-weight:700;font-size:.85rem;">${e.topic}</span>
        <span style="font-size:.65rem;color:var(--muted);">${e.date}</span>
      </div>
      <div style="font-size:.8rem;color:var(--text2);line-height:1.5;white-space:pre-wrap;">${e.desc}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  initStats();
  initHeatmap();
  initSubjectPie();
  initDailyChart();
  initMockChart();
  initMockTable();
  initErrorBook();
});

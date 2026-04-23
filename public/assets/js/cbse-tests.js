const CBSE_TYPE = 'cbse';
let cbseLastAnalysis = null;
let cbseScoreTargetId = null;
let cbseTypeFilter = 'all';

// ── Test type config ────────────────────────────────────────────────
const CBSE_TEST_TYPES = {
  ut:        { label:'Unit Test',   icon:'📋', color:'var(--purple)', cls:'type-ut',       defaultMax:30,  multiSubject:false },
  half:      { label:'Half Yearly', icon:'📅', color:'var(--cyan)',   cls:'type-half',     defaultMax:70,  multiSubject:true  },
  preboard:  { label:'Pre-board',   icon:'📄', color:'var(--amber)',  cls:'type-preboard', defaultMax:70,  multiSubject:true  },
  board:     { label:'Board Exam',  icon:'🎓', color:'var(--green)',  cls:'type-board',    defaultMax:70,  multiSubject:true  },
  practical: { label:'Practical',   icon:'🔬', color:'var(--blue)',   cls:'type-practical',defaultMax:30,  multiSubject:false },
};

const CBSE_SUBJECTS = {
  phy:  { name:'Physics',              icon:'⚡', color:'var(--phy)',  max:70 },
  chem: { name:'Chemistry',            icon:'🧪', color:'var(--chem)', max:70 },
  math: { name:'Mathematics',          icon:'∑',  color:'var(--math)', max:70 },
  eng:  { name:'English',              icon:'📖', color:'var(--eng)',  max:70 },
  pe:   { name:'Physical Education',   icon:'🏃', color:'var(--pe)',   max:70 },
};

const CBSE_TYPE_SUBJECTS = {
  ut: null,       // single-subject, uses selected subject
  half: ['phy','chem','math','eng','pe'],
  preboard: ['phy','chem','math','eng','pe'],
  board: ['phy','chem','math','eng','pe'],
  practical: null, // single-subject
};

// ── Type filter ─────────────────────────────────────────────────────
function setTypeFilter(v, btn) {
  cbseTypeFilter = v;
  document.querySelectorAll('.tabs .tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCbseTests();
}

// ── Add modal: type picker ──────────────────────────────────────────
function selectCbseType(el) {
  document.querySelectorAll('#cbseTypePicker .cat-opt').forEach(o => {
    o.style.borderColor = 'var(--border)'; o.style.background = 'transparent';
  });
  const type = el.dataset.type;
  const conf = CBSE_TEST_TYPES[type];
  el.style.borderColor = conf.color;
  document.getElementById('cbseTestType').value = type;
  // Show/hide subject picker
  document.getElementById('cbseSingleSubjectRow').style.display = conf.multiSubject ? 'none' : 'block';
  // Update max marks default
  document.getElementById('cbseMaxMarks').value = conf.defaultMax;
}

function selectCbseSubj(el) {
  document.querySelectorAll('#cbseSubjectPicker .cat-opt').forEach(o => {
    o.style.borderColor = 'var(--border)'; o.style.background = 'transparent';
  });
  const subj = el.dataset.subj;
  el.style.borderColor = CBSE_SUBJECTS[subj]?.color || 'var(--blue)';
  document.getElementById('cbseSubject').value = subj;
}

// ── Analyzer tabs ────────────────────────────────────────────────────
function switchCbseTab(tab, btn) {
  document.querySelectorAll('#addCbseModal .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('cbseTextTab').style.display  = tab==='text'?'block':'none';
  document.getElementById('cbseFileTab').style.display  = tab==='file'?'block':'none';
}

function onCbseFileSelected(input) {
  const f = input.files[0];
  document.getElementById('cbseFileChosen').textContent = f ? `✅ ${f.name}` : '';
}

async function analyzeCbseSyllabus() {
  const btn = document.getElementById('cbseAnalyzeBtn');
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  btn.disabled = true;
  try {
    const fi   = document.getElementById('cbseFileInput');
    const text = document.getElementById('cbseSyllabusText').value.trim();
    if (!fi.files[0] && !text) { toast('Paste text or upload a file first', 'error'); return; }
    const type = document.getElementById('cbseTestType').value;
    cbseLastAnalysis = await AI.analyzeSyllabus(text, CBSE_TYPE, fi.files[0] ? fi : null);
    // Build all-subject chips
    const all = [...(cbseLastAnalysis.physics||[]),...(cbseLastAnalysis.chemistry||[]),...(cbseLastAnalysis.mathematics||[]),...(cbseLastAnalysis.english||[]),...(cbseLastAnalysis.physical_education||[])];
    document.getElementById('cbseChips').innerHTML = all.slice(0,12).map(t =>
      `<span class="topic-chip">${t}</span>`).join('') + (all.length>12?`<span class="topic-chip">+${all.length-12} more</span>`:'');
    document.getElementById('cbseSyllabusResult').style.display = 'block';
    toast('Syllabus analyzed!', 'success');
  } catch(e) { toast(e.message, 'error'); }
  btn.innerHTML = '🤖 Analyze Syllabus with AI';
  btn.disabled = false;
}

// ── Save CBSE test ──────────────────────────────────────────────────
function saveCbseTest() {
  const name  = document.getElementById('cbseTestName').value.trim();
  const date  = document.getElementById('cbseTestDate').value;
  const type  = document.getElementById('cbseTestType').value;
  const subj  = document.getElementById('cbseSubject').value;
  const max   = +document.getElementById('cbseMaxMarks').value || CBSE_TEST_TYPES[type].defaultMax;
  const conf  = CBSE_TEST_TYPES[type];
  if (!name || !date) { toast('Fill in test name and date!', 'error'); return; }
  S.saveTest(CBSE_TYPE, {
    id: uuid(), name, date, type: CBSE_TYPE, cbseType: type,
    subject: conf.multiSubject ? null : subj,
    maxScore: max,
    multiSubject: conf.multiSubject,
    syllabus: cbseLastAnalysis || null,
    score: null,
  });
  cbseLastAnalysis = null;
  document.getElementById('cbseTestName').value = '';
  document.getElementById('cbseSyllabusText').value = '';
  document.getElementById('cbseSyllabusResult').style.display = 'none';
  closeModal('addCbseModal');
  renderCbseTests();
  toast('CBSE test added!', 'success');
}

// ── Render tests ─────────────────────────────────────────────────────
function renderCbseTests() {
  let tests = S.getTests(CBSE_TYPE).sort((a,b) => new Date(a.date)-new Date(b.date));
  if (cbseTypeFilter !== 'all') tests = tests.filter(t => t.cbseType === cbseTypeFilter);
  const el = document.getElementById('cbseTestList');

  // Conflict check
  const dateMap = {};
  tests.forEach(t => { if(!dateMap[t.date]) dateMap[t.date]=[]; dateMap[t.date].push(t.name); });
  const banner = document.getElementById('conflictBanner');
  banner.innerHTML = '';
  Object.entries(dateMap).filter(([,v])=>v.length>1).forEach(([d,names]) => {
    const b = document.createElement('div');
    b.className = 'warning-banner';
    b.innerHTML = `⚠️ Tests coinciding on <strong>${formatDate(d)}</strong>: ${names.join(' & ')}`;
    banner.appendChild(b);
  });

  if (!tests.length) {
    el.innerHTML = `<div style="color:var(--muted);font-size:.83rem;">${cbseTypeFilter==='all'?'No CBSE tests added yet.':'No '+CBSE_TEST_TYPES[cbseTypeFilter]?.label+' tests found.'}</div>`;
    return;
  }

  el.innerHTML = '';
  tests.forEach(t => {
    const days = daysUntil(t.date);
    const conf = CBSE_TEST_TYPES[t.cbseType] || CBSE_TEST_TYPES.ut;
    const urgency = days < 0 ? 'past' : days <= 3 ? 'urgent' : days <= 7 ? 'warning' : '';
    const card = document.createElement('div');
    card.className = `test-card cbse-type ${urgency}`;
    card.style.marginBottom = '10px';

    // Score display
    let scoreHtml = '';
    if (t.score !== null && t.score !== undefined) {
      if (t.multiSubject && typeof t.score === 'object' && !t.score.total) {
        // Per-subject display
        const rows = Object.entries(t.score).map(([sk, sv]) => {
          if (!CBSE_SUBJECTS[sk]) return '';
          const sub = CBSE_SUBJECTS[sk];
          const pct = Math.round(sv.marks/sv.max*100);
          const col = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
          return `<span style="font-size:.72rem;color:${col};font-weight:700">${sub.icon}${sv.marks}/${sv.max}</span>`;
        }).filter(Boolean).join(' ');
        const totMarks = Object.values(t.score).reduce((s,v)=>s+(v.marks||0),0);
        const totMax   = Object.values(t.score).reduce((s,v)=>s+(v.max||0),0);
        const totPct   = Math.round(totMarks/totMax*100);
        const col = totPct>=75?'var(--green)':totPct>=50?'var(--amber)':'var(--red)';
        scoreHtml = `<div style="margin-top:8px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">${rows}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:1rem;font-weight:800;color:${col}">${totMarks}/${totMax}</span>
            <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${totPct}%;background:${col}"></div></div>
            <span style="font-size:.72rem;color:var(--muted)">${totPct}%</span>
          </div>
        </div>`;
      } else {
        const sc = typeof t.score === 'object' ? t.score : { marks: t.score, max: t.maxScore };
        const pct = Math.round((sc.marks||t.score)/(sc.max||t.maxScore)*100);
        const col = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
        scoreHtml = `<div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <span style="font-size:1.1rem;font-weight:800;color:${col}">${sc.marks||t.score}/${sc.max||t.maxScore}</span>
          <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${pct}%;background:${col}"></div></div>
          <span style="font-size:.75rem;color:var(--muted)">${pct}%</span>
        </div>`;
      }
    }

    const subjLabel = t.multiSubject ? 'All subjects' : (CBSE_SUBJECTS[t.subject]?.name || t.subject);
    const syllabusHint = t.syllabus ? `<span style="font-size:.68rem;color:var(--muted)"> • 📖 Syllabus attached</span>` : '';

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div style="flex:1">
          <div style="font-weight:700;font-size:.92rem;margin-bottom:4px;">${t.name}</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
            <span class="test-type-badge ${conf.cls}">${conf.icon} ${conf.label}</span>
            <span style="font-size:.72rem;color:var(--muted)">📅 ${formatDate(t.date)}</span>
            <span style="font-size:.72rem;color:var(--muted)">📚 ${subjLabel}${syllabusHint}</span>
            <span style="font-size:.72rem;color:${days<0?'var(--muted)':days<=7?'var(--red)':'var(--green)'}">
              ${days<0?'Completed':days===0?'🔴 TODAY':days+' days left'}
            </span>
          </div>
          ${scoreHtml}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm" onclick="openCbseScoreModal('${t.id}')">📊 Score</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCbseTest('${t.id}')">🗑</button>
        </div>
      </div>
      ${days >= 0 && days <= 30 ? `<div id="timer_${t.id}" style="margin-top:10px;"></div>` : ''}`;
    el.appendChild(card);
    if (days >= 0 && days <= 30) renderCountdown(t.date + 'T00:00:00', `timer_${t.id}`);
  });
}

// ── Score Modal ─────────────────────────────────────────────────────
function openCbseScoreModal(id) {
  cbseScoreTargetId = id;
  const t = S.getTests(CBSE_TYPE).find(t => t.id === id);
  const conf = CBSE_TEST_TYPES[t.cbseType] || CBSE_TEST_TYPES.ut;

  document.getElementById('cbseScoreTestName').textContent = t.name;
  document.getElementById('cbseScoreTypeBadge').innerHTML =
    `<span class="test-type-badge ${conf.cls}">${conf.icon} ${conf.label}</span>`;

  const multi = t.multiSubject;
  document.getElementById('cbseSingleScore').style.display = multi ? 'none' : 'block';
  document.getElementById('cbseMultiScore').style.display  = multi ? 'block' : 'none';

  if (!multi) {
    const sub = CBSE_SUBJECTS[t.subject] || { name: t.subject };
    document.getElementById('cbseScoreSubjLabel').textContent = `${sub.icon||'📝'} ${sub.name} — Marks Obtained`;
    document.getElementById('cbseSingleMax').value = t.maxScore || conf.defaultMax;
    const sc = t.score;
    document.getElementById('cbseSingleMarks').value = sc ? (typeof sc === 'object' ? sc.marks : sc) : '';
    calcCbseSingle();
  } else {
    // Build per-subject rows
    const subjects = CBSE_TYPE_SUBJECTS[t.cbseType] || ['phy','chem','math','eng','pe'];
    const existing = (typeof t.score === 'object' && t.score) ? t.score : {};
    const maxPerSubj = Math.round((t.maxScore || 350) / subjects.length);
    document.getElementById('cbseSubjectScoreRows').innerHTML = subjects.map(sk => {
      const sub = CBSE_SUBJECTS[sk];
      const saved = existing[sk] || {};
      return `<div class="subj-score-row">
        <div class="subj-dot" style="background:${sub.color}"></div>
        <span class="subj-label">${sub.icon} ${sub.name}</span>
        <input class="subj-input" id="multi_${sk}" type="number" placeholder="–"
          value="${saved.marks||''}" oninput="calcCbseMulti()"
          min="0" max="${saved.max||70}">
        <span class="subj-max">/ <input class="subj-input" id="multimax_${sk}" type="number"
          value="${saved.max||70}" style="width:50px" oninput="calcCbseMulti()"></span>
        <span class="subj-pct" id="multip_${sk}" style="color:var(--muted)">–</span>
      </div>`;
    }).join('');
    calcCbseMulti();
  }

  openModal('cbseScoreModal');
}

function calcCbseSingle() {
  const m = +(document.getElementById('cbseSingleMarks')?.value || 0);
  const x = +(document.getElementById('cbseSingleMax')?.value || 30);
  const pct = x ? Math.round(m/x*100) : 0;
  const el = document.getElementById('cbseSingleDisplay');
  if (el) {
    el.textContent = `${m} / ${x}`;
    el.style.color = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
  }
}

function calcCbseMulti() {
  let totM=0, totX=0;
  const t = S.getTests(CBSE_TYPE).find(t=>t.id===cbseScoreTargetId);
  const subjects = CBSE_TYPE_SUBJECTS[t?.cbseType] || ['phy','chem','math','eng','pe'];
  subjects.forEach(sk => {
    const m = +(document.getElementById(`multi_${sk}`)?.value||0);
    const x = +(document.getElementById(`multimax_${sk}`)?.value||70);
    totM += m; totX += x;
    const pct = x ? Math.round(m/x*100) : 0;
    const pel = document.getElementById(`multip_${sk}`);
    if (pel) { pel.textContent = x?`${pct}%`:'–'; pel.style.color = pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)'; }
  });
  const tot = document.getElementById('cbseMultiTotal');
  const bar = document.getElementById('cbseMultiBar');
  const pct = totX ? Math.round(totM/totX*100) : 0;
  if (tot) tot.textContent = `${totM} / ${totX}`;
  if (bar) { bar.style.width=pct+'%'; bar.style.background=pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--red)'; }
}

function saveCbseScore() {
  const tests = S.getTests(CBSE_TYPE);
  const t = tests.find(t => t.id === cbseScoreTargetId);
  if (!t) return;

  let scoreObj, totalMarks, totalMax;
  if (t.multiSubject) {
    const subjects = CBSE_TYPE_SUBJECTS[t.cbseType] || ['phy','chem','math','eng','pe'];
    scoreObj = {};
    totalMarks = 0; totalMax = 0;
    subjects.forEach(sk => {
      const m = +(document.getElementById(`multi_${sk}`)?.value || 0);
      const x = +(document.getElementById(`multimax_${sk}`)?.value || 70);
      scoreObj[sk] = { marks: m, max: x };
      totalMarks += m; totalMax += x;
    });
    t.maxScore = totalMax;
  } else {
    totalMarks = +(document.getElementById('cbseSingleMarks').value || 0);
    totalMax   = +(document.getElementById('cbseSingleMax').value || 30);
    scoreObj = { marks: totalMarks, max: totalMax };
    t.maxScore = totalMax;
  }

  t.score = scoreObj;
  S.saveTest(CBSE_TYPE, t);
  S.addMockScore({ testId: t.id, score: totalMarks, max: totalMax, type: CBSE_TYPE, testName: t.name, category: t.cbseType });
  closeModal('cbseScoreModal');
  renderCbseTests();
  toast('Score saved!', 'success');
}

function deleteCbseTest(id) {
  if (!confirm('Delete this test?')) return;
  S.deleteTest(CBSE_TYPE, id);
  renderCbseTests();
  toast('Test deleted', 'info');
}

// ── Modals ─────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Init ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  renderCbseTests();
  initChatbox('cbseChatbox', 'cbse', ()=>'');
  document.getElementById('cbseTestDate').value = today();

  // Setup CBSE drop zone
  const dz = document.getElementById('cbseDropZone');
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) { document.getElementById('cbseFileInput').files = e.dataTransfer.files; onCbseFileSelected(document.getElementById('cbseFileInput')); }
    });
  }

  document.querySelectorAll('.modal-overlay').forEach(m =>
    m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); }));
});

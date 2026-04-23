let lastAnalysis = null;
let scoreTargetId = null;
const TEST_TYPE = 'jee';

// ── Category picker ───────────────────────────────────────────────
const CAT_DEFAULTS = { main:300, advanced:360, both:660, school:300 };
const CAT_LABELS   = { main:'📝 JEE Main', advanced:'🏆 JEE Advanced', both:'⚡ Main + Advanced', school:'🏫 School Mock' };
const CAT_COLORS   = { main:'var(--blue)', advanced:'var(--purple)', both:'var(--cyan)', school:'var(--amber)' };

function selectCat(el, hiddenId) {
  el.closest('#categoryPicker').querySelectorAll('.cat-opt').forEach(o => {
    o.style.borderColor = 'var(--border)';
    o.style.background  = 'transparent';
  });
  const cat = el.dataset.cat;
  const col = CAT_COLORS[cat];
  el.style.borderColor = col;
  el.style.background  = col.replace('var(','rgba(').replace(')',',.12)'); // rough tint
  document.getElementById(hiddenId).value = cat;
  // auto-set max score
  const maxEl = document.getElementById('testMax');
  if (maxEl) maxEl.value = CAT_DEFAULTS[cat];
  // show/hide max row
  const maxRow = document.getElementById('addMaxRow');
  if (maxRow) maxRow.style.display = (cat==='main'||cat==='advanced') ? 'none' : 'block';
}

function onSaveCatChange() {
  const cat = document.getElementById('saveTestCat').value;
  const maxRow = document.getElementById('saveMaxRow');
  if (maxRow) {
    maxRow.style.display = (cat==='main'||cat==='advanced') ? 'none' : 'block';
    document.getElementById('saveTestMax').value = CAT_DEFAULTS[cat];
  }
}

// ── Score live calculators ────────────────────────────────────────
function calcMainTotal() {
  const p = +(document.getElementById('sc_phy')?.value||0);
  const c = +(document.getElementById('sc_chem')?.value||0);
  const m = +(document.getElementById('sc_math')?.value||0);
  const total = p+c+m;
  const el = document.getElementById('mainTotalDisplay');
  if (el) {
    el.textContent = `${total} / 300`;
    el.style.color = total>=200?'var(--green)':total>=150?'var(--amber)':'var(--red)';
  }
}
function calcAdvTotal() {
  const p1 = +(document.getElementById('sc_p1')?.value||0);
  const p2 = +(document.getElementById('sc_p2')?.value||0);
  const m1 = +(document.getElementById('sc_p1max')?.value||180);
  const m2 = +(document.getElementById('sc_p2max')?.value||180);
  const el = document.getElementById('advTotalDisplay');
  if (el) el.textContent = `${p1+p2} / ${m1+m2}`;
}
function calcBothTotal() {
  const mp = +(document.getElementById('sb_phy')?.value||0)+(+(document.getElementById('sb_chem')?.value||0))+(+(document.getElementById('sb_math')?.value||0));
  const ap = +(document.getElementById('sb_p1')?.value||0)+(+(document.getElementById('sb_p2')?.value||0));
  const mb = document.getElementById('bothMainDisplay');
  const ab = document.getElementById('bothAdvDisplay');
  if (mb) mb.textContent = `${mp}/300`;
  if (ab) ab.textContent = `${ap}/360`;
}

// ── Analyzer Tabs ─────────────────────────────────────────────────
function switchAnalyzerTab(tab, btn) {
  document.querySelectorAll('#addTestModal .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('analyzerTextTab').style.display = tab==='text'?'block':'none';
  document.getElementById('analyzerFileTab').style.display = tab==='file'?'block':'none';
}

function onFileSelected(input) {
  const f = input.files[0];
  document.getElementById('fileChosen').textContent = f ? `✅ ${f.name} (${(f.size/1024/1024).toFixed(2)} MB)` : '';
}

// Drag & drop
document.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('dropZone');
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) { document.getElementById('fileInput').files = e.dataTransfer.files; onFileSelected(document.getElementById('fileInput')); }
    });
  }
});

// ── Analyze syllabus INSIDE the add-test modal ────────────────────
async function analyzeInModal() {
  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  btn.disabled = true;
  try {
    const fileInput = document.getElementById('fileInput');
    const text = document.getElementById('syllabusText').value.trim();
    if (!fileInput.files[0] && !text) { toast('Paste syllabus text or upload a file first.', 'error'); return; }
    lastAnalysis = await AI.analyzeSyllabus(text, TEST_TYPE, fileInput.files[0] ? fileInput : null);
    // Show chips inline inside modal
    const subs = [{k:'physics',label:'Physics',color:'var(--phy)',icon:'⚡'},{k:'chemistry',label:'Chemistry',color:'var(--chem)',icon:'🧪'},{k:'mathematics',label:'Mathematics',color:'var(--math)',icon:'∑'}];
    document.getElementById('subjectChips').innerHTML = subs.map(s => {
      const topics = lastAnalysis[s.k] || [];
      if (!topics.length) return '';
      return `<div><div style="font-size:.7rem;font-weight:700;color:${s.color};margin-bottom:4px;">${s.icon} ${s.label} (${topics.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${topics.slice(0,8).map(t=>`<span class="topic-chip" style="color:${s.color};border-color:${s.color}30">${t}</span>`).join('')}${topics.length>8?`<span class="topic-chip">+${topics.length-8} more</span>`:''}</div></div>`;
    }).join('');
    document.getElementById('syllabusAnalyzed').style.display = 'block';
    toast('Syllabus analyzed! Save test to attach it.', 'success');
  } catch(e) { toast(e.message, 'error'); }
  btn.innerHTML = '🤖 Analyze Syllabus with AI';
  btn.disabled = false;
}

// ── Save Test ─────────────────────────────────────────────────────
function openSaveTestModal() { document.getElementById('saveTestDate').value = today(); openModal('saveTestModal'); }

function saveAnalyzedTest() {
  const name = document.getElementById('saveTestName').value.trim();
  const date = document.getElementById('saveTestDate').value;
  const max = +document.getElementById('saveTestMax').value || 300;
  if (!name || !date) { toast('Fill in name and date', 'error'); return; }
  const test = { id: uuid(), name, date, maxScore: max, type: TEST_TYPE, syllabus: lastAnalysis, score: null };
  S.saveTest(TEST_TYPE, test);
  closeModal('saveTestModal');
  renderTests();
  toast('Test saved!', 'success');
}

function saveNewTest() {
  const name = document.getElementById('testName').value.trim();
  const date = document.getElementById('testDate').value;
  const cat  = document.getElementById('testCat')?.value || 'main';
  const max  = cat==='main'?300:cat==='advanced'?360:cat==='both'?660:300;
  if (!name || !date) { toast('Fill in test name and date!', 'error'); return; }
  S.saveTest(TEST_TYPE, { id:uuid(), name, date, maxScore:max, jeeCategory:cat, type:TEST_TYPE, syllabus:lastAnalysis||null, score:null });
  lastAnalysis = null;
  document.getElementById('testName').value = '';
  document.getElementById('syllabusText').value = '';
  document.getElementById('syllabusAnalyzed').style.display = 'none';
  closeModal('addTestModal');
  renderTests();
  toast('Test added!', 'success');
}

// ── Render test card ──────────────────────────────────────────────
function getCatBadge(cat) {
  const labels = { main:'📝 JEE Main', advanced:'🏆 JEE Advanced', both:'⚡ Main+Adv', school:'🏫 School' };
  const colors = { main:'badge-blue', advanced:'badge-purple', both:'badge-green', school:'badge-amber' };
  return `<span class="badge ${colors[cat]||'badge-blue'}">${labels[cat]||'JEE'}</span>`;
}
function renderTests() {
  const tests = S.getTests(TEST_TYPE).sort((a,b) => new Date(a.date)-new Date(b.date));
  const el = document.getElementById('testList');

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

  if (!tests.length) { el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;">No JEE tests added yet.</div>'; return; }

  el.innerHTML = '';
  tests.forEach(t => {
    const days = daysUntil(t.date);
    const urgency = days < 0 ? 'past' : days <= 3 ? 'urgent' : days <= 7 ? 'warning' : '';
    const card = document.createElement('div');
    card.className = `test-card jee-type ${urgency}`;
    card.style.marginBottom = '12px';

    const sc = t.score;
    let scoreHtml = '';
    if (sc !== null && sc !== undefined) {
      const cat = t.jeeCategory || 'main';
      const total = typeof sc === 'object' ? sc.total : sc;
      const max   = t.maxScore || 300;
      const col   = scoreColor(total, max);
      let breakdown = '';
      if (cat==='main' && typeof sc==='object' && sc.phy!==undefined) {
        breakdown = `<span style="font-size:.7rem;color:var(--muted)"> &nbsp;⚡${sc.phy} 🧪${sc.chem} ∑${sc.math}</span>`;
      } else if (cat==='advanced' && typeof sc==='object' && sc.p1!==undefined) {
        breakdown = `<span style="font-size:.7rem;color:var(--muted)"> &nbsp;P1:${sc.p1} P2:${sc.p2}</span>`;
      } else if (cat==='both' && typeof sc==='object') {
        breakdown = `<span style="font-size:.7rem;color:var(--muted)"> &nbsp;Main:${sc.mainTotal||0} Adv:${sc.advTotal||0}</span>`;
      }
      scoreHtml = `<div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
        <div style="font-size:1.1rem;font-weight:800;color:${col}">${total}/${max}</div>
        ${breakdown}
        <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${Math.round(total/max*100)}%;background:${col}"></div></div>
        <span style="font-size:.75rem;color:var(--muted)">${Math.round(total/max*100)}%</span>
      </div>`;
    }


    const syllabusHtml = t.syllabus
      ? `<div style="font-size:.72rem;color:var(--muted);margin-top:6px;">
           📊 ${(t.syllabus.physics||[]).length} Phy • ${(t.syllabus.chemistry||[]).length} Chem • ${(t.syllabus.mathematics||[]).length} Math topics
         </div>` : '';

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div style="flex:1">
          <div style="font-weight:700;font-size:.92rem;margin-bottom:4px;">${t.name}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">
            ${getCatBadge(t.jeeCategory||'main')}
            <span style="font-size:.75rem;color:var(--muted)">📅 ${formatDate(t.date)} &nbsp;•&nbsp; <span style="color:${days<0?'var(--muted)':days<=7?'var(--red)':'var(--green)'}">
              ${days < 0 ? 'Completed' : days === 0 ? '🔴 TODAY' : days + ' days left'}
            </span></span>
          </div>
          ${syllabusHtml}${scoreHtml}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm" onclick="openScoreModal('${t.id}')">📝 Score</button>
          ${t.syllabus ? `<button class="btn btn-ghost btn-sm" onclick="showSyllabus('${t.id}')">📋</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteTest('${t.id}')">🗑</button>
        </div>
      </div>
      ${days >= 0 && days <= 30 ? `<div id="timer_${t.id}" style="margin-top:12px;"></div>` : ''}`;
    el.appendChild(card);
    if (days >= 0 && days <= 30) renderCountdown(t.date + 'T00:00:00', `timer_${t.id}`);
  });
}

function scoreColor(score, max) {
  const pct = score/max;
  if (pct >= 0.67) return 'var(--green)';
  if (pct >= 0.5) return 'var(--amber)';
  return 'var(--red)';
}

// ── Score Modal ───────────────────────────────────────────────────
function openScoreModal(id) {
  scoreTargetId = id;
  const t = S.getTests(TEST_TYPE).find(t=>t.id===id);
  const cat = t.jeeCategory || 'main';
  document.getElementById('scoreTestName').textContent = t.name;
  document.getElementById('scoreCatBadge').innerHTML = getCatBadge(cat) + ` <span style="font-size:.75rem;color:var(--muted);margin-left:6px">${CAT_LABELS[cat]}</span>`;
  // Hide all sections
  ['scoreMain','scoreAdvanced','scoreBoth','scoreSchool'].forEach(id=>{ document.getElementById(id).style.display='none'; });
  // Prefill existing scores
  const sc = t.score || {};
  if (cat==='main') {
    document.getElementById('scoreMain').style.display='block';
    document.getElementById('sc_phy').value  = sc.phy  || '';
    document.getElementById('sc_chem').value = sc.chem || '';
    document.getElementById('sc_math').value = sc.math || '';
    calcMainTotal();
  } else if (cat==='advanced') {
    document.getElementById('scoreAdvanced').style.display='block';
    document.getElementById('sc_p1').value    = sc.p1    || '';
    document.getElementById('sc_p2').value    = sc.p2    || '';
    document.getElementById('sc_p1max').value = sc.p1max || 180;
    document.getElementById('sc_p2max').value = sc.p2max || 180;
    calcAdvTotal();
  } else if (cat==='both') {
    document.getElementById('scoreBoth').style.display='block';
    document.getElementById('sb_phy').value  = sc.mainPhy  || '';
    document.getElementById('sb_chem').value = sc.mainChem || '';
    document.getElementById('sb_math').value = sc.mainMath || '';
    document.getElementById('sb_p1').value   = sc.advP1    || '';
    document.getElementById('sb_p2').value   = sc.advP2    || '';
    calcBothTotal();
  } else {
    document.getElementById('scoreSchool').style.display='block';
    document.getElementById('sc_school').value    = sc.total || '';
    document.getElementById('sc_schoolmax').value = t.maxScore || 300;
  }
  openModal('scoreModal');
}

function saveScore() {
  const tests = S.getTests(TEST_TYPE);
  const t = tests.find(t=>t.id===scoreTargetId);
  if (!t) return;
  const cat = t.jeeCategory || 'main';
  let scoreObj = {}, totalScore = 0, maxScore = t.maxScore || 300;

  if (cat==='main') {
    const p=+(document.getElementById('sc_phy').value||0);
    const c=+(document.getElementById('sc_chem').value||0);
    const m=+(document.getElementById('sc_math').value||0);
    scoreObj = { phy:p, chem:c, math:m, total:p+c+m };
    totalScore=p+c+m; maxScore=300;
  } else if (cat==='advanced') {
    const p1=+(document.getElementById('sc_p1').value||0);
    const p2=+(document.getElementById('sc_p2').value||0);
    const m1=+(document.getElementById('sc_p1max').value||180);
    const m2=+(document.getElementById('sc_p2max').value||180);
    scoreObj = { p1, p2, p1max:m1, p2max:m2, total:p1+p2 };
    totalScore=p1+p2; maxScore=m1+m2;
  } else if (cat==='both') {
    const mp=+(document.getElementById('sb_phy').value||0)+(+(document.getElementById('sb_chem').value||0))+(+(document.getElementById('sb_math').value||0));
    const ap=+(document.getElementById('sb_p1').value||0)+(+(document.getElementById('sb_p2').value||0));
    scoreObj = { mainPhy:+(document.getElementById('sb_phy').value||0), mainChem:+(document.getElementById('sb_chem').value||0), mainMath:+(document.getElementById('sb_math').value||0), advP1:+(document.getElementById('sb_p1').value||0), advP2:+(document.getElementById('sb_p2').value||0), mainTotal:mp, advTotal:ap, total:mp+ap };
    totalScore=mp+ap; maxScore=660;
  } else {
    totalScore=+(document.getElementById('sc_school').value||0);
    maxScore=+(document.getElementById('sc_schoolmax').value||300);
    scoreObj = { total:totalScore };
  }
  t.score = scoreObj; t.maxScore = maxScore;
  S.saveTest(TEST_TYPE, t);
  S.addMockScore({ testId:scoreTargetId, score:totalScore, max:maxScore, type:TEST_TYPE, testName:t.name, category:cat, breakdown:scoreObj });
  closeModal('scoreModal');
  renderTests();
  toast('Score saved!', 'success');
}

// ── Delete ────────────────────────────────────────────────────────
function deleteTest(id) {
  if (!confirm('Delete this test?')) return;
  S.deleteTest(TEST_TYPE, id);
  renderTests();
  toast('Test deleted', 'info');
}

// ── Show Syllabus ─────────────────────────────────────────────────
function showSyllabus(id) {
  const t = S.getTests(TEST_TYPE).find(t=>t.id===id);
  if (!t?.syllabus) return;
  lastAnalysis = t.syllabus;
  showAnalysisResult(t.syllabus);
  document.getElementById('analysisResult').scrollIntoView({behavior:'smooth'});
}

// ── Chatbox ───────────────────────────────────────────────────────
function getSyllabusCtx() {
  if (!lastAnalysis) return '';
  const s = lastAnalysis;
  return `Physics: ${(s.physics||[]).slice(0,5).join(', ')}... Chemistry: ${(s.chemistry||[]).slice(0,5).join(', ')}... Math: ${(s.mathematics||[]).slice(0,5).join(', ')}`;
}

// ── Modals ────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  renderTests();
  initChatbox('jeeChatbox', 'jee', getSyllabusCtx);
  document.getElementById('testDate').value = today();
  document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); }));
});

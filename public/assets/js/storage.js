// ─── Theme System ─────────────────────────────────────────────────
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('jt_theme') || 'dark';
    this.apply(saved);
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem('jt_theme', next);
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = theme === 'dark'
      ? '☀️ <span>Light Mode</span>'
      : '🌙 <span>Dark Mode</span>';
  }
};

// ─── Scroll Reveal ─────────────────────────────────────────────────
const ScrollReveal = {
  init() {
    const els = document.querySelectorAll('.scroll-reveal,.scroll-reveal-left,.scroll-reveal-scale');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
  }
};

// ─── Storage Keys ───────────────────────────────────────────────
const KEYS = {
  API_KEY_VISION:  'jt_api_key_vision',
  API_KEY_REASON:  'jt_api_key_reason',
  STUDY_LOGS:'jt_study_logs', JEE_TESTS:'jt_jee_tests',
  CBSE_TESTS:'jt_cbse_tests', TASKS:'jt_tasks', SYLLABUS:'jt_syllabus',
  MOCK_SCORES:'jt_mock_scores', MOMENTUM:'jt_momentum', MOMENTUM_DATE:'jt_momentum_date',
  ERROR_BOOK:'jt_error_book'
};

const S = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k,v) => {
    localStorage.setItem(k, JSON.stringify(v));
    if (k !== 'jt_theme' && !k.includes('api_key')) {
      const dump = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('jt_') && !key.includes('api_key')) {
          try { dump[key] = JSON.parse(localStorage.getItem(key)); }
          catch { dump[key] = localStorage.getItem(key); }
        }
      }
      fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dump)
      }).catch(e => console.error('Auto-backup failed:', e));
    }
  },
  getVisionKey:  () => localStorage.getItem(KEYS.API_KEY_VISION) || localStorage.getItem('jt_api_key') || '',
  getReasonKey:  () => localStorage.getItem(KEYS.API_KEY_REASON) || localStorage.getItem('jt_api_key') || '',
  setVisionKey:  k  => localStorage.setItem(KEYS.API_KEY_VISION, k),
  setReasonKey:  k  => localStorage.setItem(KEYS.API_KEY_REASON, k),
  // Legacy compat — returns reasoning key as default
  getApiKey: () => localStorage.getItem(KEYS.API_KEY_REASON) || localStorage.getItem(KEYS.API_KEY_VISION) || localStorage.getItem('jt_api_key') || '',
  setApiKey: k  => localStorage.setItem(KEYS.API_KEY_REASON, k),

  getStudyLogs: () => S.get(KEYS.STUDY_LOGS) || [],
  setStudyLogs: v => S.set(KEYS.STUDY_LOGS, v),
  logStudy(date, data) {
    const logs = S.getStudyLogs();
    const idx = logs.findIndex(l => l.date === date);
    const entry = { date, phy:0, chem:0, math:0, eng:0, pe:0, notes:'', ...data };
    entry.total = (entry.phy||0)+(entry.chem||0)+(entry.math||0)+(entry.eng||0)+(entry.pe||0);
    if (idx >= 0) logs[idx] = entry; else logs.push(entry);
    S.set(KEYS.STUDY_LOGS, logs);
  },
  getLogForDate: date => S.getStudyLogs().find(l => l.date === date) || null,
  getLast30Logs() {
    const logs = S.getStudyLogs();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push(logs.find(l => l.date === ds) || { date:ds, phy:0, chem:0, math:0, eng:0, pe:0, total:0 });
    }
    return days;
  },

  getTests: (type='jee') => S.get(type==='jee'?KEYS.JEE_TESTS:KEYS.CBSE_TESTS) || [],
  saveTest(type, test) {
    const tests = S.getTests(type);
    const idx = tests.findIndex(t => t.id === test.id);
    if (idx >= 0) tests[idx] = test; else tests.push(test);
    S.set(type==='jee'?KEYS.JEE_TESTS:KEYS.CBSE_TESTS, tests);
  },
  deleteTest: (type, id) => S.set(type==='jee'?KEYS.JEE_TESTS:KEYS.CBSE_TESTS, S.getTests(type).filter(t=>t.id!==id)),
  getAllTests: () => [...(S.get(KEYS.JEE_TESTS)||[]).map(t=>({...t,type:'jee'})),
                     ...(S.get(KEYS.CBSE_TESTS)||[]).map(t=>({...t,type:'cbse'}))]
                    .sort((a,b)=>new Date(a.date)-new Date(b.date)),

  getTasks: date => (S.get(KEYS.TASKS)||{})[date] || [],
  setTasks(date, tasks) { const all=S.get(KEYS.TASKS)||{}; all[date]=tasks; S.set(KEYS.TASKS,all); },
  addTask(date, task) { const tasks=S.getTasks(date); tasks.push({id:Date.now().toString(36),done:false,...task}); S.setTasks(date,tasks); },
  toggleTask(date, id) { S.setTasks(date, S.getTasks(date).map(t=>t.id===id?{...t,done:!t.done}:t)); },
  deleteTask: (date,id) => S.setTasks(date, S.getTasks(date).filter(t=>t.id!==id)),

  getSyllabus: () => S.get(KEYS.SYLLABUS) || defaultSyllabus(),
  updateChapter(sub, ch, data) { const syl=S.getSyllabus(); if(!syl[sub])syl[sub]={}; syl[sub][ch]={...syl[sub][ch],...data}; S.set(KEYS.SYLLABUS,syl); },

  getMockScores: () => S.get(KEYS.MOCK_SCORES) || [],
  addMockScore: entry => { const s=S.getMockScores(); s.push({id:Date.now().toString(36),date:today(),...entry}); S.set(KEYS.MOCK_SCORES,s); },
  getMomentum: () => S.get(KEYS.MOMENTUM),
  setMomentum: v => { S.set(KEYS.MOMENTUM,v); S.set(KEYS.MOMENTUM_DATE,today()); },
  getMomentumDate: () => localStorage.getItem(KEYS.MOMENTUM_DATE),

  getErrors: () => S.get(KEYS.ERROR_BOOK) || [],
  addError: err => { const e=S.getErrors(); e.push({id:Date.now().toString(36),date:today(),...err}); S.set(KEYS.ERROR_BOOK,e); },
  deleteError: id => S.set(KEYS.ERROR_BOOK, S.getErrors().filter(x=>x.id!==id)),
};

function defaultSyllabus() {
  return {
    phy:{ 'Kinematics':{done:false,rev:0,conf:0},'Laws of Motion':{done:false,rev:0,conf:0},'Work & Energy':{done:false,rev:0,conf:0},'Rotational Motion':{done:false,rev:0,conf:0},'Gravitation':{done:false,rev:0,conf:0},'SHM & Waves':{done:false,rev:0,conf:0},'Thermodynamics':{done:false,rev:0,conf:0},'Electrostatics':{done:false,rev:0,conf:0},'Current Electricity':{done:false,rev:0,conf:0},'Magnetism & EMI':{done:false,rev:0,conf:0},'Optics':{done:false,rev:0,conf:0},'Modern Physics':{done:false,rev:0,conf:0} },
    chem:{ 'Mole Concept':{done:false,rev:0,conf:0},'Atomic Structure':{done:false,rev:0,conf:0},'Chemical Bonding':{done:false,rev:0,conf:0},'Thermodynamics':{done:false,rev:0,conf:0},'Equilibrium':{done:false,rev:0,conf:0},'Electrochemistry':{done:false,rev:0,conf:0},'Chemical Kinetics':{done:false,rev:0,conf:0},'Periodic Table':{done:false,rev:0,conf:0},'s & p Block':{done:false,rev:0,conf:0},'d Block & Coord':{done:false,rev:0,conf:0},'Hydrocarbons':{done:false,rev:0,conf:0},'Organic Functions':{done:false,rev:0,conf:0} },
    math:{ 'Complex Numbers':{done:false,rev:0,conf:0},'Quadratic Equations':{done:false,rev:0,conf:0},'Sequences & Series':{done:false,rev:0,conf:0},'Permutations & Combinations':{done:false,rev:0,conf:0},'Binomial Theorem':{done:false,rev:0,conf:0},'Probability':{done:false,rev:0,conf:0},'Limits & Continuity':{done:false,rev:0,conf:0},'Derivatives':{done:false,rev:0,conf:0},'Integration':{done:false,rev:0,conf:0},'Diff. Equations':{done:false,rev:0,conf:0},'Coordinate Geometry':{done:false,rev:0,conf:0},'Vectors & 3D':{done:false,rev:0,conf:0},'Trigonometry':{done:false,rev:0,conf:0} },
    eng:{ 'Reading Comprehension':{done:false,rev:0,conf:0},'Writing Skills':{done:false,rev:0,conf:0},'Grammar':{done:false,rev:0,conf:0},'Literature - Prose':{done:false,rev:0,conf:0},'Literature - Poetry':{done:false,rev:0,conf:0} },
    pe:{ 'Physical Fitness':{done:false,rev:0,conf:0},'Sports & Games':{done:false,rev:0,conf:0},'Yoga & Health':{done:false,rev:0,conf:0},'First Aid':{done:false,rev:0,conf:0} }
  };
}

// ─── Helpers ─────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function uuid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function daysUntil(ds) { return Math.ceil((new Date(ds)-new Date(today()))/86400000); }
function formatDate(ds) { return new Date(ds).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function subName(k) { return {phy:'Physics',chem:'Chemistry',math:'Mathematics',eng:'English',pe:'Phys. Ed'}[k]||k; }
function subColor(k) { return {phy:'var(--phy)',chem:'var(--chem)',math:'var(--math)',eng:'var(--eng)',pe:'var(--pe)'}[k]||'var(--blue)'; }

// ─── Toast ────────────────────────────────────────────────────────
function toast(msg, type='info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c=document.createElement('div'); c.className='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span>${msg}`;
  c.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}

// ─── API Status ───────────────────────────────────────────────────
function initApiStatus() {
  const dot = document.getElementById('apiDot');
  const lbl = document.getElementById('apiLabel');
  if (!dot) return;
  const hasVision = !!S.getVisionKey();
  const hasReason = !!S.getReasonKey();
  if (hasVision && hasReason) {
    dot.className = 'api-dot ok';
    if (lbl) lbl.textContent = 'API Connected';
  } else if (hasVision || hasReason) {
    dot.className = 'api-dot warn';
    if (lbl) lbl.textContent = 'Partial API Key';
  } else {
    dot.className = 'api-dot';
    if (lbl) lbl.textContent = 'No API Key';
  }
}

function openApiModal() {
  // Inject modal if not already present
  if (!document.getElementById('nimApiModal')) {
    const m = document.createElement('div');
    m.id = 'nimApiModal';
    m.className = 'modal-overlay';
    m.innerHTML = `
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <div class="modal-title">🔑 NVIDIA NIM API Keys</div>
          <button class="btn-icon" onclick="document.getElementById('nimApiModal').classList.remove('open')">✕</button>
        </div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:16px;line-height:1.6">
          Get free keys at <strong>build.nvidia.com</strong> → click any model → <strong>"Get API Key"</strong><br>
          One key works for both — or use separate keys if you have them.
        </div>

        <div class="form-group">
          <label class="form-label" style="color:var(--purple)">👁️ Vision Key</label>
          <div style="font-size:.7rem;color:var(--muted);margin-bottom:4px">Used for: PDF &amp; image syllabus uploads</div>
          <div style="font-size:.68rem;color:var(--muted);margin-bottom:6px">Model: <strong>Llama 3.2 90B Vision</strong> (meta/llama-3.2-90b-vision-instruct)</div>
          <input class="form-input" id="nimVisionKeyInput" type="password"
            placeholder="nvapi-xxxxxxxxxxxxxxxxxxxx"
            value="${S.getVisionKey()}">
          <button class="btn btn-ghost btn-sm" style="margin-top:6px;font-size:.68rem"
            onclick="const i=document.getElementById('nimVisionKeyInput');i.type=i.type==='password'?'text':'password'">👁 Show / Hide</button>
        </div>

        <div class="form-group">
          <label class="form-label" style="color:var(--blue)">🧠 Reasoning Key</label>
          <div style="font-size:.7rem;color:var(--muted);margin-bottom:4px">Used for: AI Coach, Momentum Analysis, Text Syllabus</div>
          <div style="font-size:.68rem;color:var(--muted);margin-bottom:6px">Model: <strong>Mixtral 8x7B Instruct</strong> (mistralai/mixtral-8x7b-instruct-v0.1)</div>
          <input class="form-input" id="nimReasonKeyInput" type="password"
            placeholder="nvapi-xxxxxxxxxxxxxxxxxxxx"
            value="${S.getReasonKey()}">
          <button class="btn btn-ghost btn-sm" style="margin-top:6px;font-size:.68rem"
            onclick="const i=document.getElementById('nimReasonKeyInput');i.type=i.type==='password'?'text':'password'">👁 Show / Hide</button>
        </div>

        <div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;font-size:.72rem;color:var(--muted);margin-bottom:10px">
          💡 <strong>Tip:</strong> If you have only one key, paste it in <em>both</em> fields — it will work fine.
        </div>

        <div id="nimTestResult" style="display:none;background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;font-size:.78rem;margin-bottom:10px;line-height:1.8;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button class="btn btn-ghost" onclick="testNimKeys()">🔍 Test Keys</button>
          <button class="btn btn-primary" onclick="saveNimKeys()">💾 Save Keys</button>
        </div>
      </div>`;
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
    document.body.appendChild(m);
  } else {
    // Refresh values and reset test result
    document.getElementById('nimVisionKeyInput').value = S.getVisionKey();
    document.getElementById('nimReasonKeyInput').value = S.getReasonKey();
    const tr = document.getElementById('nimTestResult');
    if (tr) { tr.style.display='none'; tr.innerHTML=''; }
  }
  document.getElementById('nimApiModal').classList.add('open');
}

function saveNimKeys() {
  const vk = document.getElementById('nimVisionKeyInput').value.trim();
  const rk = document.getElementById('nimReasonKeyInput').value.trim();
  if (vk && !vk.startsWith('nvapi-')) { toast('Vision key should start with nvapi-', 'error'); return; }
  if (rk && !rk.startsWith('nvapi-')) { toast('Reasoning key should start with nvapi-', 'error'); return; }
  S.setVisionKey(vk);
  S.setReasonKey(rk);
  initApiStatus();
  document.getElementById('nimApiModal').classList.remove('open');
  toast('API keys saved! ✅', 'success');
}

async function testNimKeys() {
  const vk = document.getElementById('nimVisionKeyInput').value.trim();
  const rk = document.getElementById('nimReasonKeyInput').value.trim();
  const resEl = document.getElementById('nimTestResult');
  resEl.innerHTML = '<span class="spinner"></span> Testing keys...';
  resEl.style.display = 'block';
  try {
    const r = await fetch('/api/ping', {
      headers: { 'x-vision-key': vk || rk, 'x-reason-key': rk || vk }
    });
    const data = await r.json();
    const rIcon = data.reason?.ok ? '✅' : '❌';
    const vIcon = data.vision?.ok ? '✅' : '❌';
    const rMsg  = data.reason?.ok ? `${data.reason.model} — ${data.reason.ms}ms` : data.reason?.error;
    const vMsg  = data.vision?.ok ? `${data.vision.model} — ${data.vision.ms}ms` : data.vision?.error;
    resEl.innerHTML = `
      <div style="margin-bottom:5px">${rIcon} <strong>Reasoning:</strong> <span style="color:${data.reason?.ok?'var(--green)':'var(--red)'};font-size:.75rem">${rMsg}</span></div>
      <div>${vIcon} <strong>Vision:</strong> <span style="color:${data.vision?.ok?'var(--green)':'var(--red)'};font-size:.75rem">${vMsg}</span></div>`;
  } catch(e) {
    resEl.innerHTML = `❌ Test failed: ${e.message}`;
    resEl.style.color = 'var(--red)';
  }
}

// ─── Active nav ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  ScrollReveal.init();
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.href === location.href) l.classList.add('active');
  });
});

// ─── Data Export / Import ─────────────────────────────────────────
function exportData() {
  const dataKeys = [
    KEYS.STUDY_LOGS, KEYS.JEE_TESTS, KEYS.CBSE_TESTS,
    KEYS.TASKS, KEYS.SYLLABUS, KEYS.MOCK_SCORES,
    KEYS.MOMENTUM, KEYS.MOMENTUM_DATE,
  ];
  const snapshot = { _version: 2, _exported: new Date().toISOString(), data: {} };
  dataKeys.forEach(k => {
    const v = localStorage.getItem(k);
    if (v) snapshot.data[k] = JSON.parse(v);
  });

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `jee-tracker-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof toast === 'function') toast('Backup downloaded! Keep this file safe. 💾', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type  = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const snapshot = JSON.parse(ev.target.result);
        if (!snapshot._version || !snapshot.data) {
          throw new Error('Invalid backup file — not a JEE Tracker backup.');
        }
        const count = Object.keys(snapshot.data).length;
        if (!confirm(`Restore ${count} data keys from backup dated ${snapshot._exported?.slice(0,10) || 'unknown'}?\n\nThis will REPLACE your current data. Cannot be undone.`)) return;

        Object.entries(snapshot.data).forEach(([k, v]) => {
          localStorage.setItem(k, JSON.stringify(v));
        });
        if (typeof toast === 'function') toast('Data restored successfully! Reloading...', 'success');
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        if (typeof toast === 'function') toast('Import failed: ' + err.message, 'error');
        else alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

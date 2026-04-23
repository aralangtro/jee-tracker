// ── Daily Thoughts & Quotes ──────────────────────────────────────
const THOUGHTS = [
  "JEE is not about studying everything — it's about mastering the right things. Depth beats breadth every time.",
  "The student who studies 6 focused hours beats the one who sits 12 distracted hours. Protect your focus fiercely.",
  "Every concept you master today is a question you'll smile at on exam day.",
  "Consistency is the compound interest of learning. Small daily efforts create massive results.",
  "Never skip Physics numericals. JEE rewards those who practice, not those who read.",
  "Chemistry is 50% understanding, 50% memorization. Build a reaction map — you'll thank yourself later.",
  "Mathematics is learned by doing, not watching. Close the book and solve from memory.",
  "Your preparation is a marathon. On tough days, just show up. Momentum comes from motion.",
  "Fear of a topic means you haven't practiced it enough. Attack your weakest subject first every day.",
  "Every JEE topper had days when nothing made sense. They kept going. So must you.",
  "Don't compare your Chapter 3 to someone else's Chapter 10. Everyone's journey is different.",
  "Revision is where marks are made. First learning opens the door; revision burns it into memory.",
  "Sleep is not laziness — it's when your brain consolidates everything you studied. Protect 7-8 hours.",
  "A problem solved without looking at the solution is worth 10 problems read with the answer.",
  "The mock test is the most underrated tool in JEE prep. Treat every mock like the real exam.",
  "Hard work without smart strategy is like running fast in the wrong direction. Plan your week.",
  "Doubt every concept until you can explain it to someone else. That's when you truly know it.",
  "JEE Advanced isn't testing what you know — it's testing how you think. Train your thinking.",
  "Three hours of distraction-free study is more valuable than eight hours with your phone nearby.",
  "A rank is determined on a single day. Your character is built across thousands of days of preparation.",
  "Never leave a mock test unanalyzed. The error log is your personalized study guide.",
  "Physical fitness improves mental stamina. A 20-minute walk can reset a foggy brain.",
  "The difference between a 95 percentile and 99 percentile student is usually 3-4 key topics mastered deeply.",
  "Learn the 'why' behind every formula. Derivations build intuition that saves you in tricky questions.",
  "You are not competing with others — you are competing with the version of you from yesterday.",
  "Important topics deserve more revisions, not more first readings. Revisit what matters most.",
  "Start every study session by reviewing yesterday's notes. Spaced repetition is scientifically proven.",
  "When stuck, don't spend more than 15 minutes on a single problem. Move on, come back later.",
  "Chemistry naming and reactions seem boring until they appear in every other question. Learn them now.",
  "The most dangerous feeling in JEE prep is thinking you know something you've only seen once.",
];

const QUOTES = [
  { q: "The only way to do great work is to love what you do.", a: "— Steve Jobs" },
  { q: "Intelligence is the ability to adapt to change.", a: "— Stephen Hawking" },
  { q: "In the middle of every difficulty lies opportunity.", a: "— Albert Einstein" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "— Winston Churchill" },
  { q: "The more that you read, the more things you will know.", a: "— Dr. Seuss" },
  { q: "Education is the most powerful weapon which you can use to change the world.", a: "— Nelson Mandela" },
  { q: "Mathematics is the queen of the sciences.", a: "— Carl Friedrich Gauss" },
  { q: "Do not go where the path may lead; go instead where there is no path and leave a trail.", a: "— Ralph Waldo Emerson" },
  { q: "The mind is not a vessel to be filled but a fire to be kindled.", a: "— Plutarch" },
  { q: "Genius is one percent inspiration, ninety-nine percent perspiration.", a: "— Thomas Edison" },
  { q: "Physics is the most fundamental of all the sciences.", a: "— Richard Feynman" },
  { q: "Imagination is more important than knowledge.", a: "— Albert Einstein" },
  { q: "The expert in anything was once a beginner.", a: "— Helen Hayes" },
  { q: "Don't watch the clock; do what it does. Keep going.", a: "— Sam Levenson" },
  { q: "Success is the sum of small efforts, repeated day in and day out.", a: "— Robert Collier" },
  { q: "Science is a way of thinking much more than it is a body of knowledge.", a: "— Carl Sagan" },
  { q: "If you can dream it, you can do it.", a: "— Walt Disney" },
  { q: "The only limit to our realization of tomorrow is our doubts of today.", a: "— Franklin D. Roosevelt" },
  { q: "Hardships often prepare ordinary people for an extraordinary destiny.", a: "— C.S. Lewis" },
  { q: "It always seems impossible until it's done.", a: "— Nelson Mandela" },
  { q: "The beautiful thing about learning is that no one can take it away from you.", a: "— B.B. King" },
  { q: "Chemistry is the study of matter, but I prefer to see it as the study of change.", a: "— Breaking Bad" },
  { q: "There is no shortcut to achievement. Life requires payment in advance.", a: "— Napoleon Hill" },
  { q: "The secret of getting ahead is getting started.", a: "— Mark Twain" },
  { q: "You don't have to be great to start, but you have to start to be great.", a: "— Zig Ziglar" },
  { q: "Failure is simply the opportunity to begin again, this time more intelligently.", a: "— Henry Ford" },
  { q: "A person who never made a mistake never tried anything new.", a: "— Albert Einstein" },
  { q: "The more you sweat in practice, the less you bleed in battle.", a: "— Richard Marcinko" },
  { q: "Your time is limited, so don't waste it living someone else's life.", a: "— Steve Jobs" },
  { q: "Push yourself, because no one else is going to do it for you.", a: "— Unknown" },
];

function getDailyIndex(len) {
  const start = new Date('2024-01-01');
  const diff = Math.floor((new Date() - start) / 86400000);
  return diff % len;
}

// ── Greeting & Date ───────────────────────────────────────────────
function initHeader() {
  const h = new Date().getHours();
  const greetings = ['Good Night 🌙','Good Morning ☀️','Good Afternoon 🌤️','Good Evening 🌆'];
  const g = h<5?0:h<12?1:h<17?2:3;
  document.getElementById('greeting').textContent = greetings[g] + ', Keep Grinding!';
  document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

// ── Daily Thought ─────────────────────────────────────────────────
function initThought() {
  const t = THOUGHTS[getDailyIndex(THOUGHTS.length)];
  const q = QUOTES[getDailyIndex(QUOTES.length)];
  document.getElementById('dailyThought').textContent = t;
  document.getElementById('dailyQuote').textContent = `"${q.q}"`;
  document.getElementById('quoteAuthor').textContent = q.a;
}

// ── Stats ─────────────────────────────────────────────────────────
function initStats() {
  const todayLog = S.getLogForDate(today());
  const totalToday = todayLog ? todayLog.total : 0;
  document.getElementById('statTodayHours').textContent = totalToday.toFixed(1) + 'h';
  if (todayLog) {
    document.getElementById('statTodayBreakdown').innerHTML =
      `P:${todayLog.phy}h C:${todayLog.chem}h M:${todayLog.math}h`;
  }

  const logs = S.getStudyLogs();
  const weekTotal = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    return (now - d) / 86400000 <= 7;
  }).reduce((s,l) => s + (l.total||0), 0);
  document.getElementById('statWeekHours').textContent = weekTotal.toFixed(1) + 'h';

  // Streak
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const l = logs.find(x => x.date === ds);
    if (l && l.total > 0) streak++;
    else if (i > 0) break;
  }
  document.getElementById('statStreak').textContent = streak;

  // Syllabus
  const sylDataStat = (() => { try { return JSON.parse(localStorage.getItem('jt_syl2')) || {}; } catch { return {}; } })();
  let done = 0, total = 0;
  ['phy', 'chem', 'math'].forEach(subKey => {
    if (typeof JEE_SYLLABUS !== 'undefined' && JEE_SYLLABUS[subKey]) {
      JEE_SYLLABUS[subKey].chapters.forEach(ch => {
        total++;
        const st = (sylDataStat[ch.id] && sylDataStat[ch.id].status) ? sylDataStat[ch.id].status : 'todo';
        if (st === 'mastered' || st === 'pyqs') done++;
      });
    }
  });
  const pct = total ? Math.round(done/total*100) : 0;
  document.getElementById('statSyllabus').textContent = pct + '%';
  document.getElementById('statSyllabusSub').textContent = `${done}/${total} chapters`;
}

// ── Subject Progress ──────────────────────────────────────────────
function initSubjectProgress() {
  // Real syllabus data is stored in jt_syl2 by the Syllabus page
  // Structure: { [chapId]: { status:'todo'|'theory'|'pyqs'|'mastered', rev:N, topics:{} } }
  const sylData = (() => { try { return JSON.parse(localStorage.getItem('jt_syl2')) || {}; } catch { return {}; } })();
  // Fallback old store (for Eng/PE not in JEE_SYLLABUS)
  const oldSyl  = S.getSyllabus();

  // Status → readiness weight (out of 4, same scale as PCM pie charts)
  const STATUS_W = { todo: 0, theory: 1, pyqs: 2.5, mastered: 4 };
  // Status → short label for pills
  const STATUS_LABEL = { mastered: '✅ Mastered', pyqs: '📘 PYQs', theory: '📖 Theory', todo: '📋 Todo' };
  const STATUS_COLOR = { mastered: 'var(--green)', pyqs: 'var(--blue)', theory: 'var(--amber)', todo: 'var(--muted)' };

  const SUBJECTS = [
    { k: 'phy',  n: 'Physics',      c: 'var(--phy)',  icon: '⚡' },
    { k: 'chem', n: 'Chemistry',    c: 'var(--chem)', icon: '🧪' },
    { k: 'math', n: 'Mathematics',  c: 'var(--math)', icon: '∑'  },
    { k: 'eng',  n: 'English',      c: 'var(--eng)',  icon: '📖' },
    { k: 'pe',   n: 'Phys. Ed',     c: 'var(--pe)',   icon: '🏃' },
  ];

  const el = document.getElementById('subjectProgress');
  el.innerHTML = SUBJECTS.map(s => {
    // PCM: use JEE_SYLLABUS + jt_syl2 real data
    if (typeof JEE_SYLLABUS !== 'undefined' && JEE_SYLLABUS[s.k]) {
      const chapters = JEE_SYLLABUS[s.k].chapters || [];
      const total    = chapters.length;
      let scoreSum   = 0;
      let mastered   = 0, pyqs = 0, theory = 0, todo = 0;

      chapters.forEach(ch => {
        const d      = sylData[ch.id] || {};
        const status = d.status || 'todo';
        scoreSum += STATUS_W[status] || 0;
        if (status === 'mastered') mastered++;
        else if (status === 'pyqs') pyqs++;
        else if (status === 'theory') theory++;
        else todo++;
      });

      const readyPct = total ? Math.round(scoreSum / (total * 4) * 100) : 0;

      // Build mini status pill row
      const pills = [
        mastered ? `<span style="font-size:.62rem;padding:1px 6px;border-radius:20px;background:rgba(16,217,138,.15);color:var(--green);font-weight:700;">✅ ${mastered}</span>` : '',
        pyqs     ? `<span style="font-size:.62rem;padding:1px 6px;border-radius:20px;background:rgba(91,141,238,.15);color:var(--blue);font-weight:700;">📘 ${pyqs}</span>` : '',
        theory   ? `<span style="font-size:.62rem;padding:1px 6px;border-radius:20px;background:rgba(251,191,36,.15);color:var(--amber);font-weight:700;">📖 ${theory}</span>` : '',
        todo     ? `<span style="font-size:.62rem;padding:1px 6px;border-radius:20px;background:rgba(255,255,255,.07);color:var(--muted);font-weight:700;">📋 ${todo}</span>` : '',
      ].filter(Boolean).join(' ');

      return `<div style="margin-bottom:2px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:.82rem;font-weight:700;color:${s.c}">${s.icon} ${s.n}</span>
          <span style="font-size:.75rem;color:var(--muted)">${mastered}/${total} mastered &nbsp;·&nbsp; <span style="color:${s.c};font-weight:700;">${readyPct}% ready</span></span>
        </div>
        <div class="progress-bar" style="margin-bottom:5px;"><div class="progress-fill" style="width:${readyPct}%;background:${s.c}"></div></div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">${pills || '<span style="font-size:.62rem;color:var(--muted);">No progress yet</span>'}</div>
      </div>`;
    }

    // Eng / Phys. Ed — fallback to old simple syllabus
    const chs  = Object.values(oldSyl[s.k] || {});
    const done = chs.filter(c => c.done).length;
    const pct  = chs.length ? Math.round(done / chs.length * 100) : 0;
    return `<div style="margin-bottom:2px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:.82rem;font-weight:700;color:${s.c}">${s.icon} ${s.n}</span>
        <span style="font-size:.75rem;color:var(--muted)">${done}/${chs.length} — <span style="color:${s.c};font-weight:700;">${pct}%</span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${s.c}"></div></div>
    </div>`;
  }).join('');
}

// ── Heatmap ───────────────────────────────────────────────────────
function initHeatmap() {
  const logs = S.getLast30Logs();
  const el = document.getElementById('heatmap');
  el.innerHTML = logs.map(l => {
    const h  = Math.min(Math.round(l.total), 10);
    const ds = new Date(l.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'});

    let cellStyle = '';
    let ratingTitle = '';

    if (l.aiRating !== undefined && l.aiRating !== null && l.total > 0) {
      // Full rating-based color — overrides blue intensity scale
      const r = l.aiRating;
      let bg, border, glow;
      if      (r < 30) { bg = 'rgba(240,82,82,.75)';  border = 'var(--red)';    glow = 'rgba(240,82,82,.4)'; }
      else if (r < 60) { bg = 'rgba(251,146,60,.75)'; border = 'var(--orange)'; glow = 'rgba(251,146,60,.4)'; }
      else if (r < 80) { bg = 'rgba(234,179,8,.75)';  border = '#eab308';       glow = 'rgba(234,179,8,.4)'; }
      else             { bg = 'rgba(16,217,138,.75)';  border = 'var(--green)';  glow = 'rgba(16,217,138,.4)'; }

      // Scale opacity slightly by hours studied (more hours = more opaque)
      const opacity = Math.min(0.5 + (l.total / 12) * 0.5, 1).toFixed(2);
      cellStyle = `background:${bg};opacity:${opacity};box-shadow:0 0 6px ${glow};outline:1.5px solid ${border};outline-offset:1px;`;
      ratingTitle = ` | AI: ${r}/100`;
    } else if (l.total > 0) {
      // No AI rating — use standard blue scale via data-h attribute (CSS handles it)
      ratingTitle = '';
    }

    return `<div class="heatmap-cell" data-h="${l.aiRating != null ? 'rated' : h}"
      style="${cellStyle}"
      title="${ds}: ${l.total.toFixed(1)}h studied${ratingTitle}"
      onclick="openLogModal('${l.date}')"></div>`;
  }).join('');
}


// ── Upcoming Tests ────────────────────────────────────────────────
function initUpcomingTests() {
  const tests = S.getAllTests().filter(t => daysUntil(t.date) >= 0).slice(0, 4);
  const el = document.getElementById('upcomingTests');

  if (!tests.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;">No upcoming tests. Add some in JEE/CBSE Tests pages.</div>';
    return;
  }

  // Coinciding test warning
  const dateGroups = {};
  tests.forEach(t => { if (!dateGroups[t.date]) dateGroups[t.date]=[]; dateGroups[t.date].push(t); });
  const conflicts = Object.values(dateGroups).filter(g => g.length > 1);

  el.innerHTML = '';
  if (conflicts.length) {
    conflicts.forEach(group => {
      const w = document.createElement('div');
      w.className = 'warning-banner';
      w.innerHTML = `⚠️ <strong>Tests Coinciding on ${formatDate(group[0].date)}:</strong> ${group.map(t=>t.name).join(' & ')}`;
      el.appendChild(w);
    });
  }

  tests.forEach((t, i) => {
    const days = daysUntil(t.date);
    const urgency = days <= 3 ? 'urgent' : days <= 7 ? 'warning' : '';
    const typeColor = t.type === 'jee' ? 'var(--blue)' : 'var(--green)';
    const typeBadge = t.type === 'jee' ? 'badge-blue' : 'badge-green';
    const card = document.createElement('div');
    card.className = `test-card ${t.type}-type ${urgency}`;
    card.style.marginBottom = '12px';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-weight:700;font-size:.92rem">${t.name}</div>
        <span class="badge ${typeBadge}">${t.type.toUpperCase()}</span>
      </div>
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:10px;">📅 ${formatDate(t.date)} &nbsp;•&nbsp; ${days === 0 ? 'TODAY' : days + ' days left'}</div>
      <div id="timer_${t.id}"></div>`;
    el.appendChild(card);
    renderCountdown(t.date + 'T00:00:00', `timer_${t.id}`);
  });
}

// ── Tasks ─────────────────────────────────────────────────────────
function initTasks() {
  const tasks = S.getTasks(today());
  const el = document.getElementById('tasksList');
  const subColors = {phy:'var(--phy)',chem:'var(--chem)',math:'var(--math)',eng:'var(--eng)',pe:'var(--pe)'};

  if (!tasks.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.83rem;padding:8px 0;">No tasks for today. Add some!</div>';
  } else {
    el.innerHTML = tasks.map(t => `
      <div class="task-item" id="taskItem_${t.id}">
        <div class="task-check ${t.done?'done':''}" onclick="toggleTaskDone('${t.id}')">
          ${t.done ? '✓' : ''}
        </div>
        <div class="task-sub-dot" style="background:${subColors[t.sub]||'var(--blue)'}"></div>
        <span class="task-text ${t.done?'done':''}">${t.title}</span>
        <span style="font-size:.7rem;color:var(--muted)">${subName(t.sub)}</span>
        <button class="btn-icon" style="border:none;padding:4px" onclick="deleteTaskItem('${t.id}')">🗑</button>
      </div>`).join('');

    const done = tasks.filter(t=>t.done).length;
    document.getElementById('tasksProgress').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:.72rem;color:var(--muted)">${done}/${tasks.length} done</span>
        <span style="font-size:.72rem;color:var(--green)">${Math.round(done/tasks.length*100)}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(done/tasks.length*100)}%;background:var(--green)"></div></div>`;
  }
}

// ── Momentum Analysis ─────────────────────────────────────────────
async function runMomentumAnalysis() {
  const btn = document.getElementById('analyzeBtn');
  btn.innerHTML = '<span class="spinner"></span> Analyzing...';
  btn.disabled = true;
  try {
    const result = await AI.analyzeMomentum();
    showMomentum(result);
    toast('AI analysis complete!', 'success');
  } catch(e) {
    toast(e.message, 'error');
  }
  btn.innerHTML = '🤖 Analyze';
  btn.disabled = false;
}

function showMomentum(r) {
  if (!r) return;
  const card = document.getElementById('momentumCard');
  const scoreColors = {A:'var(--green)',B:'var(--blue)',C:'var(--amber)',D:'var(--orange)',F:'var(--red)'};
  const c = scoreColors[r.grade?.charAt(0)] || 'var(--blue)';
  document.getElementById('momentumContent').innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:12px;">
      <div style="text-align:center;background:var(--bg2);border:2px solid ${c};border-radius:12px;padding:12px 16px;flex-shrink:0;">
        <div style="font-size:2.2rem;font-weight:900;color:${c}">${r.score}/10</div>
        <div style="font-size:.8rem;font-weight:700;color:${c}">${r.grade}</div>
        <div style="font-size:.65rem;color:var(--muted)">${r.momentum}</div>
      </div>
      <div>
        <p style="font-size:.83rem;line-height:1.5;margin-bottom:8px;">${r.analysis}</p>
        <div style="font-size:.78rem;color:var(--green)">✅ ${(r.strengths||[]).join(' • ')}</div>
        <div style="font-size:.78rem;color:var(--red);margin-top:4px;">⚠️ ${(r.weaknesses||[]).join(' • ')}</div>
      </div>
    </div>
    <div style="background:var(--bg2);border-radius:8px;padding:10px;font-size:.8rem;margin-bottom:8px;">
      <strong>Recommendation:</strong> ${r.recommendation}
    </div>
    <div style="font-size:.78rem;color:var(--muted);">🎯 JEE Prediction: ${r.prediction}</div>
    <div style="font-size:.65rem;color:var(--muted);margin-top:8px;">Last analyzed: ${S.getMomentumDate()}</div>`;
  card.style.display = 'block';
}

// ── Modal Controls ────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Session Types & Subjects ──────────────────────────────────────
const SESSION_TYPES = [
  { value:'pyq',      label:'📄 PYQ',            full:'PYQ Practice' },
  { value:'theory',   label:'📖 Theory',          full:'Theory Study' },
  { value:'video',    label:'🎥 Video',            full:'Video Lecture' },
  { value:'revision', label:'🔁 Revision',         full:'Revision' },
  { value:'mock',     label:'📝 Mock Test',        full:'Mock Test' },
  { value:'sample',   label:'🧩 Sample Qs',        full:'Sample Questions / Practice Problems' },
  { value:'module',   label:'📦 Module',           full:'Module / DPP' },
];
const SUBJECTS_OPT = [
  { value:'phy',  label:'⚡ Physics' },
  { value:'chem', label:'🧪 Chemistry' },
  { value:'math', label:'∑ Mathematics' },
  { value:'eng',  label:'📖 English' },
  { value:'pe',   label:'🏃 Phys. Ed' },
];

let _logDate = '';
let _logSessions = [];   // row IDs
let _lastAnalysis = null; // cache AI result

function openLogModal(date) {
  _logDate = date || today();
  _logSessions = [];
  document.getElementById('logDate').textContent = 'Logging for: ' + formatDate(_logDate);
  document.getElementById('logDescription').value = '';
  document.getElementById('sessionsList').innerHTML = '';
  addSessionRow();
  updateSubjectTotals();
  openModal('logModal');
}

// Toggle a pill button active/inactive
function toggleSessionType(rowId, typeVal) {
  const pill = document.getElementById(`${rowId}_pill_${typeVal}`);
  if (!pill) return;
  pill.classList.toggle('active');
  updateSubjectTotals();
}

function addSessionRow() {
  const id = 'sess_' + Date.now();
  const row = document.createElement('div');
  row.id = id;
  row.className = 'session-card';
  row.style.cssText = 'background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:4px;';

  const pillsHtml = SESSION_TYPES.map(t => `
    <button type="button" id="${id}_pill_${t.value}"
      class="session-pill"
      onclick="toggleSessionType('${id}', '${t.value}')"
      title="${t.full}">${t.label}</button>`).join('');

  const subOpts = SUBJECTS_OPT.map(s => `<option value="${s.value}">${s.label}</option>`).join('');

  row.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <select class="form-select" id="${id}_sub"
        style="flex:1;padding:7px 10px;font-size:.82rem;" onchange="updateSubjectTotals()">
        ${subOpts}
      </select>
      <div style="display:flex;align-items:center;gap:6px;">
        <input class="form-input" id="${id}_hrs" type="number" min="0.5" max="16" step="0.5" value="1"
          style="width:75px;padding:7px 10px;font-size:.82rem;" oninput="updateSubjectTotals()">
        <span style="font-size:.75rem;color:var(--muted);white-space:nowrap;">hrs</span>
      </div>
      <button class="btn-icon" onclick="removeSessionRow('${id}')" style="padding:6px;color:var(--red);flex-shrink:0;">✕</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">${pillsHtml}</div>`;

  document.getElementById('sessionsList').appendChild(row);
  _logSessions.push(id);
  // Select first pill by default
  const firstPill = document.getElementById(`${id}_pill_pyq`);
  if (firstPill) firstPill.classList.add('active');
}

function removeSessionRow(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  _logSessions = _logSessions.filter(s => s !== id);
  updateSubjectTotals();
}

function getSelectedTypes(rowId) {
  return SESSION_TYPES
    .filter(t => document.getElementById(`${rowId}_pill_${t.value}`)?.classList.contains('active'))
    .map(t => t.value);
}

function getSessionData() {
  return _logSessions
    .filter(id => document.getElementById(id))
    .map(id => ({
      types:   getSelectedTypes(id),             // array of selected types
      subject: document.getElementById(`${id}_sub`).value,
      hours:   parseFloat(document.getElementById(`${id}_hrs`).value) || 0,
    }))
    .filter(s => s.hours > 0);
}

function getSubjectTotals(sessions) {
  const totals = { phy:0, chem:0, math:0, eng:0, pe:0 };
  sessions.forEach(s => { if (totals[s.subject] !== undefined) totals[s.subject] += s.hours; });
  return totals;
}

function updateSubjectTotals() {
  const sessions = getSessionData();
  const totals = getSubjectTotals(sessions);
  const colors = { phy:'var(--phy)', chem:'var(--chem)', math:'var(--math)', eng:'var(--eng)', pe:'var(--pe)' };
  const labels = { phy:'⚡ Physics', chem:'🧪 Chemistry', math:'∑ Math', eng:'📖 English', pe:'🏃 Phys.Ed' };
  const el = document.getElementById('subjectTotalsPreview');
  el.innerHTML = Object.entries(totals).map(([k, h]) => `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center;">
      <div style="font-size:.7rem;color:${colors[k]};font-weight:700;margin-bottom:2px;">${labels[k]}</div>
      <div style="font-size:1.1rem;font-weight:800;color:${h>0?colors[k]:'var(--muted)'};">${h.toFixed(1)}h</div>
    </div>`).join('');
}

// ── Rating Color Helper ───────────────────────────────────────────
function getRatingColors(rating) {
  if (rating < 30)  return { bg:'rgba(240,82,82,.12)',  border:'var(--red)',    text:'var(--red)',    label:'🔴 Critical' };
  if (rating < 60)  return { bg:'rgba(251,146,60,.12)', border:'var(--orange)', text:'var(--orange)', label:'🟠 Needs Work' };
  if (rating < 80)  return { bg:'rgba(234,179,8,.12)',  border:'#eab308',       text:'#eab308',       label:'🟡 Average' };
  return             { bg:'rgba(16,217,138,.12)',  border:'var(--green)',  text:'var(--green)',  label:'🟢 Good' };
}

// ── Run AI Daily Log Analysis ─────────────────────────────────────
async function runDailyLogAnalysis() {
  const sessions     = getSessionData();
  const description  = document.getElementById('logDescription').value.trim();
  const subTotals    = getSubjectTotals(sessions);
  const subjects     = Object.entries(subTotals).map(([key,hours]) => ({key, hours})).filter(s=>s.hours>0);

  if (!sessions.length && !description) {
    toast('Add at least one session block and describe what you studied.', 'error');
    return;
  }
  // Warn if a row has no types selected
  const noType = sessions.find(s => !s.types || s.types.length === 0);
  if (noType) {
    toast('Select at least one session type (pill) per subject block.', 'error');
    return;
  }

  const btn = document.getElementById('analyzeLogBtn');
  btn.innerHTML = '<span class="spinner"></span> AI is analyzing your session...';
  btn.disabled  = true;

  try {
    const result = await AI.analyzeDailyLog({ date: _logDate, sessions, subjects, description });
    _lastAnalysis = result;
    showLogAnalysisResult(result, subTotals);
    closeModal('logModal');
    openModal('logAnalysisModal');
  } catch(e) {
    toast('AI analysis failed: ' + e.message, 'error');
  }

  btn.innerHTML = '🤖 Analyze & Preview with AI';
  btn.disabled  = false;
}

function showLogAnalysisResult(r, subTotals) {
  const rating = r.rating ?? 0;
  const colors = getRatingColors(rating);

  // ── Rating badge ──────────────────────────────────────────────
  document.getElementById('aiRatingBadge').style.cssText =
    `display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;border-radius:var(--radius-sm);border:2px solid ${colors.border};background:${colors.bg};`;
  document.getElementById('aiRatingBadge').innerHTML = `
    <div style="text-align:center;min-width:80px;">
      <div style="font-size:2.8rem;font-weight:900;color:${colors.text};line-height:1;">${rating}</div>
      <div style="font-size:.7rem;font-weight:700;color:${colors.text};letter-spacing:.05em;">/ 100</div>
      <div style="font-size:.68rem;color:${colors.text};margin-top:2px;">${colors.label}</div>
    </div>
    <div style="flex:1;">
      <div style="font-size:1rem;font-weight:800;color:${colors.text};margin-bottom:4px;">${r.grade} — ${r.verdict}</div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:8px;">
        <div style="width:${rating}%;height:100%;background:${colors.border};border-radius:4px;transition:width 1s ease;"></div>
      </div>
      <div style="font-size:.72rem;color:var(--text2);">
        ${Object.entries(subTotals).filter(([,h])=>h>0).map(([k,h])=>`<span style="margin-right:10px;color:${subColor(k)};font-weight:700;">${subName(k)}: ${h.toFixed(1)}h</span>`).join('')}
      </div>
    </div>`;

  // ── Assessment cards ──────────────────────────────────────────
  const assessments = [
    { icon:'⏱', label:'Study Time',        text: r.studyTimeAssessment },
    { icon:'📚', label:'Topic Coverage',    text: r.topicCoverageAssessment },
    { icon:'🎯', label:'Session Quality',   text: r.sessionQualityAssessment },
  ];
  document.getElementById('aiAssessmentCards').innerHTML = assessments.map(a => `
    <div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;">
      <div style="font-size:.7rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em;">${a.icon} ${a.label}</div>
      <div style="font-size:.82rem;color:var(--text);line-height:1.5;">${a.text || '—'}</div>
    </div>`).join('');

  // ── Strengths & Gaps ──────────────────────────────────────────
  document.getElementById('aiStrengthsGaps').innerHTML = `
    <div style="background:rgba(16,217,138,.07);border:1px solid rgba(16,217,138,.25);border-radius:var(--radius-sm);padding:12px;">
      <div style="font-size:.7rem;font-weight:700;color:var(--green);margin-bottom:8px;text-transform:uppercase;">✅ Strengths</div>
      ${(r.strengths||[]).map(s=>`<div style="font-size:.81rem;color:var(--text);margin-bottom:4px;">• ${s}</div>`).join('')}
    </div>
    <div style="background:rgba(240,82,82,.07);border:1px solid rgba(240,82,82,.25);border-radius:var(--radius-sm);padding:12px;">
      <div style="font-size:.7rem;font-weight:700;color:var(--red);margin-bottom:8px;text-transform:uppercase;">⚠️ Gaps</div>
      ${(r.gaps||[]).map(g=>`<div style="font-size:.81rem;color:var(--text);margin-bottom:4px;">• ${g}</div>`).join('')}
    </div>`;

  // ── Tomorrow plan ─────────────────────────────────────────────
  document.getElementById('aiTomorrowPlan').innerHTML = `
    <div style="font-size:.7rem;font-weight:700;color:var(--blue);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em;">📅 Tomorrow's Action Plan</div>
    <div style="font-size:.82rem;color:var(--text);line-height:1.6;">${r.tomorrowPlan || '—'}</div>`;

  // ── Strict verdict ────────────────────────────────────────────
  const vc = getRatingColors(rating);
  document.getElementById('aiStrictVerdict').style.cssText =
    `border-radius:var(--radius-sm);padding:12px;margin-bottom:20px;font-size:.85rem;font-weight:600;font-style:italic;background:${vc.bg};border:1px solid ${vc.border};color:${vc.text};`;
  document.getElementById('aiStrictVerdict').innerHTML =
    `💬 "${r.strictVerdict || '—'}"`;
}

// ── Confirm & Save the Log ────────────────────────────────────────
function confirmSaveStudyLog() {
  const sessions  = getSessionData();
  const subTotals = getSubjectTotals(sessions);
  const desc      = document.getElementById('logDescription').value.trim();

  // Build notes: multi-type session summary + description + AI rating
  const typeFullNames = { pyq:'PYQ', theory:'Theory', video:'Video', revision:'Revision', mock:'Mock', sample:'SampleQs', module:'Module' };
  const sessionSummary = sessions.map(s => {
    const typeStr = (s.types||[]).map(t => typeFullNames[t]||t).join('+');
    return `[${typeStr}] ${subName(s.subject)}: ${s.hours}h`;
  }).join(' | ');
  const rating = _lastAnalysis?.rating ?? null;
  const notes = [
    sessionSummary,
    desc ? `\nDescription: ${desc}` : '',
    rating !== null ? `\nAI Rating: ${rating}/100 (${_lastAnalysis?.grade} — ${_lastAnalysis?.verdict})` : '',
  ].filter(Boolean).join('');

  S.logStudy(_logDate, {
    phy:   subTotals.phy,
    chem:  subTotals.chem,
    math:  subTotals.math,
    eng:   subTotals.eng,
    pe:    subTotals.pe,
    notes,
    aiRating:  rating,
    aiGrade:   _lastAnalysis?.grade,
    aiVerdict: _lastAnalysis?.verdict,
  });

  closeModal('logAnalysisModal');
  initStats();
  initHeatmap();
  const ratingText = rating !== null ? ` AI Rating: ${rating}/100` : '';
  toast(`Study log saved!${ratingText} ✅`, 'success');
  _lastAnalysis = null;
}

function openAddTaskModal() {
  document.getElementById('taskDate').value = today();
  openModal('addTaskModal');
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const sub = document.getElementById('taskSub').value;
  const date = document.getElementById('taskDate').value || today();
  if (!title) { toast('Enter a task title', 'error'); return; }
  S.addTask(date, { title, sub });
  closeModal('addTaskModal');
  document.getElementById('taskTitle').value = '';
  initTasks();
  toast('Task added!', 'success');
}

function toggleTaskDone(id) {
  S.toggleTask(today(), id);
  initTasks();
}

function deleteTaskItem(id) {
  S.deleteTask(today(), id);
  initTasks();
}

// ── Exam Countdowns (Dynamic Settings) ───────────────────────────
let examSettings = JSON.parse(localStorage.getItem('jt_exam_settings')) || {
  examYear: '2027',
  prepStart: '2025-04-01T00:00:00',
  mainsDate: '2027-01-10T00:00:00',
  advDate: '2027-05-01T00:00:00'
};

function updateExamSettingsUI() {
  const formatUI = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
  };
  const formatShort = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', {month:'short', year:'numeric'});
  };

  if (document.getElementById('urgencyWarningText')) {
    document.getElementById('urgencyWarningText').innerHTML = `⚠️ &nbsp;JEE ${examSettings.examYear} COUNTDOWN — EVERY SECOND IS IRREPLACEABLE`;
    document.getElementById('urgencyMainsName').textContent = `JEE MAINS ${examSettings.examYear}`;
    document.getElementById('urgencyMainsDate').textContent = formatUI(examSettings.mainsDate);
    document.getElementById('mainsPrepStartLbl').textContent = formatShort(examSettings.prepStart);
    document.getElementById('mainsPrepEndLbl').textContent = formatUI(examSettings.mainsDate);

    document.getElementById('urgencyAdvName').textContent = `JEE ADVANCED ${examSettings.examYear}`;
    document.getElementById('urgencyAdvDate').textContent = formatUI(examSettings.advDate);
    document.getElementById('advPrepStartLbl').textContent = formatShort(examSettings.prepStart);
    document.getElementById('advPrepEndLbl').textContent = formatUI(examSettings.advDate);
  }
}

function openExamSettings() {
  document.getElementById('setExamYear').value = examSettings.examYear;
  document.getElementById('setPrepStart').value = examSettings.prepStart.split('T')[0];
  document.getElementById('setMainsDate').value = examSettings.mainsDate.split('T')[0];
  document.getElementById('setAdvDate').value = examSettings.advDate.split('T')[0];
  openModal('examSettingsModal');
}

function saveExamSettings() {
  const y = document.getElementById('setExamYear').value || '2027';
  const p = document.getElementById('setPrepStart').value || '2025-04-01';
  const m = document.getElementById('setMainsDate').value || '2027-01-10';
  const a = document.getElementById('setAdvDate').value || '2027-05-01';

  examSettings = {
    examYear: y,
    prepStart: p + 'T00:00:00',
    mainsDate: m + 'T00:00:00',
    advDate: a + 'T00:00:00'
  };
  localStorage.setItem('jt_exam_settings', JSON.stringify(examSettings));
  initExamCountdowns();
  closeModal('examSettingsModal');
  toast('Exam dates updated!', 'success');
}

let mainsInterval, advInterval;

function renderExamCd(targetISO, containerId, cdClass) {
  const el = document.getElementById(containerId);
  if (!el) return null;
  function tick() {
    const diff = new Date(targetISO) - new Date();
    if (diff <= 0) {
      el.innerHTML = '<span style="color:var(--red);font-size:1.3rem;font-weight:900;letter-spacing:.1em;">🚨 EXAM DAY!</span>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="urgency-cd-wrap ${cdClass}">
        <div class="urgency-cd-unit"><span class="urgency-cd-num">${String(d).padStart(3,'0')}</span><span class="urgency-cd-label">Days</span></div>
        <span class="urgency-cd-sep">:</span>
        <div class="urgency-cd-unit"><span class="urgency-cd-num">${String(h).padStart(2,'0')}</span><span class="urgency-cd-label">Hours</span></div>
        <span class="urgency-cd-sep">:</span>
        <div class="urgency-cd-unit"><span class="urgency-cd-num">${String(m).padStart(2,'0')}</span><span class="urgency-cd-label">Mins</span></div>
        <span class="urgency-cd-sep">:</span>
        <div class="urgency-cd-unit urgency-secs-unit"><span class="urgency-cd-num">${String(s).padStart(2,'0')}</span><span class="urgency-cd-label">Secs</span></div>
      </div>`;
    if (containerId === 'mainsCountdown') {
      const fEl = document.getElementById('urgencyDaysMain');
      if (fEl) fEl.textContent = d;
    }
  }
  tick();
  return setInterval(tick, 1000);
}

function initExamCountdowns() {
  updateExamSettingsUI();

  if (mainsInterval) clearInterval(mainsInterval);
  if (advInterval) clearInterval(advInterval);

  mainsInterval = renderExamCd(examSettings.mainsDate, 'mainsCountdown', 'mains-cd');
  advInterval = renderExamCd(examSettings.advDate, 'advancedCountdown', 'advanced-cd');

  const PREP_START = new Date(examSettings.prepStart);
  
  function remainingPct(examISO) {
    const now      = new Date();
    const examDate = new Date(examISO);
    const total    = examDate - PREP_START;
    const elapsed  = now - PREP_START;
    const remaining = Math.max(0, total - elapsed);
    return total > 0 ? Math.min(100, Math.max(0, Math.round(remaining / total * 100))) : 0;
  }
  const mr = remainingPct(examSettings.mainsDate);
  const ar = remainingPct(examSettings.advDate);

  const mbf = document.getElementById('mainsBarFill');
  const abf = document.getElementById('advancedBarFill');
  const mpp = document.getElementById('mainsPrepPct');
  const app = document.getElementById('advancedPrepPct');

  if (mbf) setTimeout(() => { mbf.style.width = mr + '%'; }, 300);
  if (abf) setTimeout(() => { abf.style.width = ar + '%'; }, 300);
  if (mpp) mpp.textContent = mr + '% time left';
  if (app) app.textContent = ar + '% time left';
}


// ── PCM Donut Pie Charts ──────────────────────────────────────────
function buildDonutSVG(segments, line1, line2, size) {
  size = size || 150;
  const cx = size / 2, cy = size / 2, r = 52, sw = 24;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + (g.value || 0), 0);
  const bg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${sw}"/>`;

  if (total === 0) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.25)" font-size="10" font-family="Inter,sans-serif">No data</text></svg>`;
  }

  let cum = 0;
  const arcs = segments.map(seg => {
    const len = (seg.value / total) * circ;
    const dashArr = `${len.toFixed(3)} ${(circ - len).toFixed(3)}`;
    const off = (circ / 4) - cum;
    cum += len;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${sw}" stroke-dasharray="${dashArr}" stroke-dashoffset="${off.toFixed(3)}" stroke-linecap="butt"><title>${seg.label||''}</title></circle>`;
  });

  const y1 = line2 ? cy - 10 : cy;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg}${arcs.join('')}
    <text x="${cx}" y="${y1}" text-anchor="middle" dominant-baseline="middle" fill="var(--text)" font-size="20" font-weight="800" font-family="Inter,sans-serif">${line1}</text>
    ${line2 ? `<text x="${cx}" y="${cy+12}" text-anchor="middle" dominant-baseline="middle" fill="var(--muted)" font-size="9" font-family="Inter,sans-serif" letter-spacing="0.5">${line2}</text>` : ''}
  </svg>`;
}

function initPCMPieCharts() {
  // jt_syl2 is the storage key used by syllabus.js (the real syllabus page)
  // Structure: { [chapId]: { status:'todo'|'theory'|'pyqs'|'mastered', rev:N, topics:{[topicName]:bool} } }
  const sylData = JSON.parse(localStorage.getItem('jt_syl2') || '{}');
  const logs    = S.getStudyLogs();

  const PCM = [
    { k:'phy',  name:'Physics',     short:'P', color:'#f59e0b', css:'var(--phy)'  },
    { k:'chem', name:'Chemistry',   short:'C', color:'#f05252', css:'var(--chem)' },
    { k:'math', name:'Mathematics', short:'M', color:'#8b5cf6', css:'var(--math)' },
  ];
  // Status → readiness weight out of 4
  const STATUS_SCORE = { todo:0, theory:1, pyqs:2.5, mastered:4 };
  const GRAY = 'rgba(255,255,255,0.07)';

  const metrics = PCM.map(sub => {
    const chapters   = (JEE_SYLLABUS[sub.k] || {}).chapters || [];
    const totalChaps = chapters.length;
    let masteredChaps = 0, totalTopics = 0, doneTopics = 0, scoreSum = 0;

    chapters.forEach(ch => {
      const d      = sylData[ch.id] || { status:'todo', topics:{} };
      const status = d.status || 'todo';
      if (status === 'mastered') masteredChaps++;
      scoreSum   += STATUS_SCORE[status] || 0;
      totalTopics += ch.topics.length;
      doneTopics  += Object.values(d.topics || {}).filter(Boolean).length;
    });

    const masteredPct  = totalChaps  ? Math.round(masteredChaps / totalChaps * 100)        : 0;
    const readyPct     = totalChaps  ? Math.round(scoreSum / (totalChaps * 4) * 100)        : 0;
    const topicDonePct = totalTopics ? Math.round(doneTopics / totalTopics * 100)           : 0;
    const hrs          = logs.reduce((s, l) => s + (l[sub.k] || 0), 0);

    return { ...sub, totalChaps, masteredChaps, masteredPct, readyPct,
             totalTopics, doneTopics, topicDonePct, hrs };
  });

  const totChaps   = metrics.reduce((s, m) => s + m.totalChaps,   0);
  const totMastered= metrics.reduce((s, m) => s + m.masteredChaps, 0);
  const totTopics  = metrics.reduce((s, m) => s + m.totalTopics,  0);
  const totDoneTop = metrics.reduce((s, m) => s + m.doneTopics,   0);
  const totHrs     = metrics.reduce((s, m) => s + m.hrs,          0);

  const overallTopicPct = totTopics  ? Math.round(totDoneTop  / totTopics  * 100) : 0;
  const overallReadyPct = metrics.reduce((s, m) => s + m.readyPct * m.totalChaps, 0);
  const overallReady    = totChaps   ? Math.round(overallReadyPct / totChaps)       : 0;

  // ── Chart 1: Subtopics Completed ──────────────────────────────
  const topicSeg = [
    ...metrics.map(m => ({ value: m.doneTopics, color: m.color, label: `${m.name}: ${m.doneTopics}/${m.totalTopics} subtopics` })),
    { value: Math.max(0, totTopics - totDoneTop), color: GRAY, label: 'Not checked yet' }
  ].filter(s => s.value > 0);

  // ── Chart 2: Readiness (chapter status weighted) ───────────────
  const readySeg = [
    ...metrics.map(m => ({ value: m.readyPct * m.totalChaps, color: m.color, label: `${m.name}: ${m.readyPct}% ready` })),
    { value: Math.max(0, totChaps * 100 - metrics.reduce((s, m) => s + m.readyPct * m.totalChaps, 0)), color: GRAY, label: 'Not yet' }
  ].filter(s => s.value > 0);

  // ── Chart 3: Study Hours ───────────────────────────────────────
  const hrsSeg = totHrs > 0
    ? metrics.map(m => ({ value: m.hrs, color: m.color, label: `${m.name}: ${m.hrs.toFixed(1)}h` })).filter(s => s.value > 0)
    : [{ value: 1, color: GRAY, label: 'No study hours logged yet' }];

  function legendHTML(metrics, valFn) {
    return metrics.map(m => `
      <div class="pcm-legend-item">
        <div class="pcm-legend-dot" style="background:${m.color};"></div>
        <span class="pcm-legend-label">${m.name}</span>
        <span class="pcm-legend-val">${valFn(m)}</span>
      </div>`).join('') +
      `<div class="pcm-legend-item">
        <div class="pcm-legend-dot" style="background:${GRAY};border:1px solid rgba(255,255,255,0.15);"></div>
        <span class="pcm-legend-label" style="color:var(--muted);">Remaining</span>
      </div>`;
  }

  const el = document.getElementById('pcmChartsContainer');
  if (!el) return;

  el.innerHTML = `
    <div class="pcm-charts-grid">
      <div class="pcm-chart-col">
        <div class="pcm-chart-title">📚 Subtopics Checked</div>
        ${buildDonutSVG(topicSeg, overallTopicPct + '%', 'DONE')}
        <div class="pcm-legend">${legendHTML(metrics, m => `${m.doneTopics}/${m.totalTopics}`)}</div>
      </div>
      <div class="pcm-chart-col">
        <div class="pcm-chart-title">🧠 Readiness Score</div>
        ${buildDonutSVG(readySeg, overallReady + '%', 'READY')}
        <div class="pcm-legend">${legendHTML(metrics, m => `${m.readyPct}%`)}</div>
      </div>
      <div class="pcm-chart-col">
        <div class="pcm-chart-title">⏱ Study Hours (All Time)</div>
        ${buildDonutSVG(hrsSeg, totHrs > 0 ? totHrs.toFixed(0) + 'h' : '0h', 'TOTAL')}
        <div class="pcm-legend">${legendHTML(metrics, m => m.hrs.toFixed(0) + 'h')}</div>
      </div>
    </div>
    <div class="pcm-stats-row">
      ${metrics.map(m => `
        <div class="pcm-stat-cell">
          <div class="pcm-stat-val" style="color:${m.css};">${m.topicDonePct}%</div>
          <div style="font-size:.72rem;font-weight:700;color:${m.css};margin-bottom:2px;">${m.short} — ${m.name}</div>
          <div class="pcm-stat-sub">
            ${m.doneTopics}/${m.totalTopics} subtopics done<br>
            ${m.masteredChaps}/${m.totalChaps} chapters mastered<br>
            ${m.readyPct}% ready · ${m.hrs.toFixed(1)}h studied
          </div>
        </div>`).join('')}
    </div>`;
}

// ── Init ──────────────────────────────────────────────────────────
function init() {
  initApiStatus();
  initHeader();
  initThought();
  initStats();
  initSubjectProgress();
  initHeatmap();
  initUpcomingTests();
  initTasks();
  initExamCountdowns();
  initPCMPieCharts();
  const saved = S.getMomentum();
  if (saved) showMomentum(saved);
}

document.addEventListener('DOMContentLoaded', init);
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); }));

// ─── CHATBOX TOGGLE ───
function toggleChat() {
  const c = document.getElementById('globalChatbox');
  c.style.display = (c.style.display==='none'||!c.style.display) ? 'flex' : 'none';
}

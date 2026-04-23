// ── State ─────────────────────────────────────────────────────────
let viewMode    = 'priority'; // 'priority' | 'unit'
let classFilter = 'both';     // 'both' | '11' | '12'
let targetFilter= 'main';     // 'main' | 'adv'
let statusFilter= 'all';      // 'all' | 'todo' | 'theory' | 'pyqs' | 'mastered'
let openSubjects = { phy: true, chem: true, math: true };
let openGroups   = {};
let openChapters = {};

// ── JEE Advanced removes some chapters (D-priority ones mostly) ──
const ADV_EXCLUDED = ['phy_comm','ch_everyday','ch_enviro','ch_poly','m_lp'];

// ── Storage helpers ───────────────────────────────────────────────
const SYL_KEY = 'jt_syl2';
function getSylData() { try { return JSON.parse(localStorage.getItem(SYL_KEY)) || {}; } catch { return {}; } }
function setSylData(d) { localStorage.setItem(SYL_KEY, JSON.stringify(d)); }

function getChapter(id) {
  const d = getSylData();
  return d[id] || { status:'todo', rev:0, topics:{} };
}
function updateChapter(id, patch) {
  const d = getSylData();
  d[id] = { ...getChapter(id), ...patch };
  setSylData(d);
}
function toggleTopic(chapId, topic) {
  const d = getSylData();
  const ch = getChapter(chapId);
  ch.topics = ch.topics || {};
  ch.topics[topic] = !ch.topics[topic];
  d[chapId] = ch;
  setSylData(d);
}

// ── Filters ───────────────────────────────────────────────────────
function setViewMode(v, btn) {
  viewMode = v;
  document.querySelectorAll('#vm_priority,#vm_unit').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}
function setClass(v, btn) {
  classFilter = v;
  document.querySelectorAll('#cl_both,#cl_11,#cl_12').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}
function setTarget(v, btn) {
  targetFilter = v;
  document.querySelectorAll('#tg_main,#tg_adv').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}
function setStatusFilter(v, btn) {
  statusFilter = v;
  document.querySelectorAll('#st_all,#st_todo,#st_theory,#st_pyqs,#st_mastered').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}

// ── Filter chapters ───────────────────────────────────────────────
function filterChapters(chapters) {
  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();
  return chapters.filter(ch => {
    if (targetFilter === 'adv' && ADV_EXCLUDED.includes(ch.id)) return false;
    if (classFilter === '11' && ch.cls !== 11) return false;
    if (classFilter === '12' && ch.cls !== 12) return false;
    if (q && !ch.name.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all') {
      const st = getChapter(ch.id).status;
      if (st !== statusFilter) return false;
    }
    return true;
  });
}

// ── Overall stats ─────────────────────────────────────────────────
function updateOverall() {
  let mst=0, pyq=0, thy=0, todo=0, total=0;
  ['phy','chem','math'].forEach(subKey => {
    if (JEE_SYLLABUS[subKey]) {
      JEE_SYLLABUS[subKey].chapters.forEach(ch => {
        if (targetFilter==='adv' && ADV_EXCLUDED.includes(ch.id)) return;
        total++;
        const st = getChapter(ch.id).status;
        if (st==='mastered') mst++;
        else if (st==='pyqs') pyq++;
        else if (st==='theory') thy++;
        else todo++;
      });
    }
  });
  const pct = total ? Math.round(((mst*1+pyq*.7+thy*.4)/total)*100) : 0;
  document.getElementById('overallStats').innerHTML = `
    <span class="prog-stat prog-mst">✅ Mastered: ${mst}</span>
    <span class="prog-stat prog-pyq">📘 + PYQs: ${pyq}</span>
    <span class="prog-stat prog-thy">📖 Theory: ${thy}</span>
    <span class="prog-stat prog-todo">📋 To Do: ${todo}</span>
  `;
  document.getElementById('overallPct').textContent = pct + '% Complete';
  document.getElementById('overallBar').style.width = pct + '%';
}

// ── Subject progress ──────────────────────────────────────────────
function getSubjectStats(sub) {
  let mst=0, total=0;
  sub.chapters.forEach(ch => {
    if (targetFilter==='adv' && ADV_EXCLUDED.includes(ch.id)) return;
    if (classFilter==='11' && ch.cls!==11) return;
    if (classFilter==='12' && ch.cls!==12) return;
    total++;
    const st = getChapter(ch.id).status;
    if (st==='mastered' || st==='pyqs') mst++;
  });
  return { mst, total, pct: total ? Math.round(mst/total*100) : 0 };
}

// ── Chapter card ──────────────────────────────────────────────────
function renderChapterCard(sub, ch) {
  const data = getChapter(ch.id);
  const isOpen = !!openChapters[ch.id];
  const isDone = data.status === 'mastered' || data.status === 'pyqs';
  const topicsDone = Object.values(data.topics||{}).filter(Boolean).length;
  const topicsTotal = ch.topics.length;

  const statusClass = `status-${data.status}`;
  const card = document.createElement('div');
  card.className = `chapter-card ${statusClass}`;
  card.id = `card_${ch.id}`;

  card.innerHTML = `
    <div class="chapter-header" onclick="toggleChapter('${ch.id}')">
      <div class="task-check ${isDone?'done':''}" style="flex-shrink:0;width:18px;height:18px;font-size:.65rem"
        onclick="quickStatus(event,'${ch.id}','${isDone?'todo':'mastered'}')">${isDone?'✓':''}</div>
      <div class="chapter-name ${isDone?'done':''}">${ch.name}</div>
      <span class="cls-badge cls-${ch.cls}">${ch.cls}th</span>
      ${data.rev>0?`<span class="rev-count">🔄${data.rev}</span>`:''}
      ${topicsTotal>0?`<span style="font-size:.65rem;color:var(--muted)">${topicsDone}/${topicsTotal}</span>`:''}
      <span class="ch-chevron ${isOpen?'open':''}">▼</span>
    </div>
    <div class="chapter-body ${isOpen?'open':''}" id="body_${ch.id}">
      <div class="status-row">
        ${STATUS_LEVELS.map(s=>`
          <button class="status-btn ${data.status===s?'active-'+s:''}"
            onclick="setStatus('${ch.id}','${s}')">${STATUS_LABELS[s]}</button>
        `).join('')}
      </div>
      <div class="rev-row">
        <span class="rev-label">Revisions</span>
        <div class="rev-controls">
          <button class="rev-btn" onclick="changeRev('${ch.id}',-1)">−</button>
          <span class="rev-num" id="rev_${ch.id}">${data.rev||0}</span>
          <button class="rev-btn" onclick="changeRev('${ch.id}',1)">+</button>
        </div>
      </div>
      ${ch.topics.length ? `
        <div class="topics-label">📝 Topic Checklist</div>
        ${ch.topics.map(t => {
          const checked = !!(data.topics||{})[t];
          return `<div class="topic-item" id="topic_${ch.id}_${t.replace(/\s/g,'_')}">
            <div class="topic-check ${checked?'checked':''}" onclick="toggleTopicUI('${ch.id}','${t.replace(/'/g,"\\'")}')">
              ${checked?'✓':''}
            </div>
            <span class="topic-text ${checked?'done':''}">${t}</span>
          </div>`;
        }).join('')}
      ` : ''}
    </div>`;
  return card;
}

// ── Group by priority ─────────────────────────────────────────────
function renderPriorityView(subKey, sub, chapters) {
  const groups = { A:[], B:[], C:[], D:[] };
  chapters.forEach(ch => groups[ch.priority]?.push(ch));
  const el = document.createElement('div');

  Object.entries(groups).forEach(([pr, chs]) => {
    if (!chs.length) return;
    const gKey = `${subKey}_${pr}`;
    const isOpen = openGroups[gKey] !== false;
    const done = chs.filter(c => ['mastered', 'pyqs'].includes(getChapter(c.id).status)).length;
    const pct = Math.round(done/chs.length*100);
    const col = PRIORITY_COLORS[pr];

    const group = document.createElement('div');
    group.className = 'priority-group';
    group.innerHTML = `
      <div class="priority-header" onclick="toggleGroup('${gKey}')">
        <span class="priority-badge" style="background:${col}22;color:${col};">${pr}</span>
        <span style="font-size:.8rem;font-weight:700;color:${col}">${PRIORITY_LABELS[pr]}</span>
        <span class="priority-count">${chs.length} chapters</span>
        <span class="priority-pct">${done}/${chs.length} mastered (${pct}%)</span>
        <span class="priority-chevron ${isOpen?'open':''}">▼</span>
      </div>
      <div class="priority-body ${isOpen?'open':''}" id="grp_${gKey}"></div>`;
    el.appendChild(group);
    const body = group.querySelector(`#grp_${gKey}`);
    chs.forEach(ch => body.appendChild(renderChapterCard(sub, ch)));
  });
  return el;
}

// ── Group by unit ─────────────────────────────────────────────────
function renderUnitView(subKey, sub, chapters) {
  const groups = {};
  chapters.forEach(ch => {
    if (!groups[ch.unit]) groups[ch.unit] = [];
    groups[ch.unit].push(ch);
  });
  const el = document.createElement('div');
  Object.entries(groups).forEach(([unit, chs]) => {
    const gKey = `${subKey}_unit_${unit}`;
    const isOpen = openGroups[gKey] !== false;
    const done = chs.filter(c => ['mastered', 'pyqs'].includes(getChapter(c.id).status)).length;

    const group = document.createElement('div');
    group.className = 'priority-group';
    group.innerHTML = `
      <div class="priority-header" onclick="toggleGroup('${gKey}')">
        <span class="priority-badge" style="background:var(--card2);color:var(--text2);">📦</span>
        <span style="font-size:.8rem;font-weight:700;color:var(--text2)">${unit}</span>
        <span class="priority-count">${chs.length} chapters</span>
        <span class="priority-pct">${done}/${chs.length} mastered</span>
        <span class="priority-chevron ${isOpen?'open':''}">▼</span>
      </div>
      <div class="priority-body ${isOpen?'open':''}" id="grp_${gKey}"></div>`;
    el.appendChild(group);
    const body = group.querySelector(`#grp_${gKey}`);
    chs.forEach(ch => body.appendChild(renderChapterCard(sub, ch)));
  });
  return el;
}

// ── Main render ───────────────────────────────────────────────────
function renderAll() {
  updateOverall();
  const rootJee = document.getElementById('syllabusRoot');
  const rootCbse = document.getElementById('syllabusRootCbse');
  if (rootJee) rootJee.innerHTML = '';
  if (rootCbse) rootCbse.innerHTML = '';

  Object.entries(JEE_SYLLABUS).forEach(([subKey, sub]) => {
    const filtered = filterChapters(sub.chapters);
    const stats = getSubjectStats(sub);

    const section = document.createElement('div');
    section.className = 'subject-section';
    section.id = `sec_${subKey}`;

    const isOpen = openSubjects[subKey] !== false;
    section.innerHTML = `
      <div class="subject-header" onclick="toggleSubject('${subKey}')">
        <span class="subject-icon">${sub.icon}</span>
        <span class="subject-name" style="color:${sub.color}">${sub.name}</span>
        <div class="subject-stats">
          <span class="sub-stat" style="color:var(--green)">✅ ${stats.mst}</span>
          <span class="sub-stat" style="color:var(--muted)">/ ${stats.total}</span>
          <span class="sub-stat" style="color:${sub.color};font-size:.8rem;">${stats.pct}%</span>
        </div>
        <span class="subject-chevron ${isOpen?'open':''}">▼</span>
      </div>
      <div class="subject-progress-bar">
        <div class="subject-progress-fill" style="width:${stats.pct}%;background:${sub.color}"></div>
      </div>
      <div class="subject-body ${isOpen?'open':''}" id="sub_${subKey}"></div>`;
      
    if (subKey === 'eng' || subKey === 'pe' || subKey.startsWith('cbse_')) {
      if (rootCbse) rootCbse.appendChild(section);
    } else {
      if (rootJee) rootJee.appendChild(section);
    }

    const body = section.querySelector(`#sub_${subKey}`);
    if (!filtered.length) {
      body.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:8px 4px;">No chapters match current filters.</div>';
    } else {
      const grouped = viewMode==='unit'
        ? renderUnitView(subKey, sub, filtered)
        : renderPriorityView(subKey, sub, filtered);
      body.appendChild(grouped);
    }
  });

  ScrollReveal.init();
}

// ── Toggle open/close ─────────────────────────────────────────────
function toggleSubject(k) {
  openSubjects[k] = !openSubjects[k];
  const body = document.getElementById(`sub_${k}`);
  const chev = body?.previousElementSibling?.previousElementSibling?.querySelector('.subject-chevron');
  body?.classList.toggle('open');
  chev?.classList.toggle('open');
}
function toggleGroup(k) {
  openGroups[k] = !(openGroups[k] !== false);
  const body = document.getElementById(`grp_${k}`);
  const chev = body?.previousElementSibling?.querySelector('.priority-chevron');
  body?.classList.toggle('open');
  chev?.classList.toggle('open');
}
function toggleChapter(id) {
  openChapters[id] = !openChapters[id];
  document.getElementById(`body_${id}`)?.classList.toggle('open');
  const card = document.getElementById(`card_${id}`);
  card?.querySelector('.ch-chevron')?.classList.toggle('open');
}

// ── Status / Rev / Topic actions ──────────────────────────────────
function setStatus(id, status) {
  updateChapter(id, { status });
  refreshCard(id);
  updateOverall();
}
function quickStatus(e, id, status) {
  e.stopPropagation();
  setStatus(id, status);
}
function changeRev(id, delta) {
  const ch = getChapter(id);
  const rev = Math.max(0, (ch.rev||0) + delta);
  updateChapter(id, { rev });
  document.getElementById(`rev_${id}`).textContent = rev;
}
function toggleTopicUI(chapId, topic) {
  toggleTopic(chapId, topic);
  const key = `topic_${chapId}_${topic.replace(/\s/g,'_')}`;
  const item = document.getElementById(key);
  if (item) {
    const ch = getChapter(chapId);
    const checked = !!(ch.topics||{})[topic];
    const chk = item.querySelector('.topic-check');
    const txt = item.querySelector('.topic-text');
    if (chk) { chk.className = `topic-check ${checked?'checked':''}`; chk.textContent = checked?'✓':''; }
    if (txt) { txt.className = `topic-text ${checked?'done':''}`; }

    // ── Update the X/Y counter in the chapter header ──────────────
    const card = document.getElementById(`card_${chapId}`);
    if (card) {
      // Find the chapter definition to get total topic count
      for (const sub of Object.values(JEE_SYLLABUS)) {
        const chapDef = sub.chapters.find(c => c.id === chapId);
        if (chapDef) {
          const data = getChapter(chapId);
          const done  = Object.values(data.topics || {}).filter(Boolean).length;
          const total = chapDef.topics.length;
          // The counter span is the last span before the chevron in the header
          const header = card.querySelector('.chapter-header');
          if (header) {
            const counter = header.querySelector('span[style*="color:var(--muted)"]');
            if (counter) counter.textContent = `${done}/${total}`;
          }
          break;
        }
      }
    }
  }
}


// ── Refresh single card after status change ───────────────────────
function refreshCard(id) {
  const oldCard = document.getElementById(`card_${id}`);
  if (!oldCard) return;
  // find which subject/chapter this belongs to
  for (const [subKey, sub] of Object.entries(JEE_SYLLABUS)) {
    const ch = sub.chapters.find(c => c.id===id);
    if (ch) {
      const wasOpen = openChapters[id];
      const newCard = renderChapterCard(sub, ch);
      oldCard.replaceWith(newCard);
      if (wasOpen) {
        document.getElementById(`body_${id}`)?.classList.add('open');
        newCard.querySelector('.ch-chevron')?.classList.add('open');
      }
      // Update subject progress bar
      const stats = getSubjectStats(sub);
      const fill = document.querySelector(`#sub_${subKey}`)?.previousElementSibling?.querySelector('.subject-progress-fill');
      if (fill) fill.style.width = stats.pct + '%';
      break;
    }
  }
}

function confirmReset() {
  if (confirm('Reset ALL syllabus progress? This cannot be undone.')) {
    localStorage.removeItem(SYL_KEY);
    openChapters = {};
    renderAll();
    toast('Syllabus reset!', 'info');
  }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  renderAll();
});

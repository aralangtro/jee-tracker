// ── State ─────────────────────────────────────────────────────────
const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let curYear, curMonth, selectedDate = null;

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApiStatus();
  const now = new Date();
  curYear  = now.getFullYear();
  curMonth = now.getMonth();
  selectedDate = today();

  buildTodayBar();
  populateSelects();
  renderCalendar();
  showDayPanel(selectedDate); // show today's panel on load

  document.querySelectorAll('.modal-overlay').forEach(m =>
    m.addEventListener('click', e => { if (e.target===m) m.classList.remove('open'); }));
});

// ── Today bar ─────────────────────────────────────────────────────
function buildTodayBar() {
  const now = new Date();
  const dow = DAYS_SHORT[now.getDay()];
  const dom = now.getDate();
  const mn  = MONTHS[now.getMonth()];
  const yr  = now.getFullYear();

  // Day of year
  const start = new Date(yr, 0, 0);
  const diff  = now - start;
  const dayOfYear = Math.floor(diff / 86400000);

  // ISO week
  const d = new Date(Date.UTC(yr, now.getMonth(), dom));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  document.getElementById('todayDow').textContent   = dow;
  document.getElementById('todayDom').textContent   = dom;
  document.getElementById('todayMonthYear').textContent = `${mn} ${yr}`;
  document.getElementById('todayMeta').textContent  = `Day ${dayOfYear}, Week ${week}`;
}

// ── Selects ───────────────────────────────────────────────────────
function populateSelects() {
  const ms = document.getElementById('monthSelect');
  const ys = document.getElementById('yearSelect');
  ms.innerHTML = MONTHS_SHORT.map((m,i) =>
    `<option value="${i}" ${i===curMonth?'selected':''}>${m}</option>`).join('');
  const now = new Date();
  ys.innerHTML = '';
  for (let y = now.getFullYear()-3; y <= now.getFullYear()+3; y++) {
    ys.innerHTML += `<option value="${y}" ${y===curYear?'selected':''}>${y}</option>`;
  }
}
function onMonthSelect() { curMonth = +document.getElementById('monthSelect').value; renderCalendar(); }
function onYearSelect()  { curYear  = +document.getElementById('yearSelect').value;  renderCalendar(); }
function changeMonth(d)  {
  curMonth += d;
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  if (curMonth > 11) { curMonth = 0;  curYear++; }
  populateSelects();
  renderCalendar();
}
function goToday() {
  const now = new Date();
  curYear  = now.getFullYear();
  curMonth = now.getMonth();
  selectedDate = today();
  populateSelects();
  renderCalendar();
  showDayPanel(selectedDate);
}

// ── Render ────────────────────────────────────────────────────────
function renderCalendar() {
  // Day name headers
  const hdEl = document.getElementById('calDayNames');
  hdEl.innerHTML = DAYS_SHORT.map(d =>
    `<div class="cal-header-cell">${d}</div>`).join('');

  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  const todayStr  = today();
  const firstDay  = new Date(curYear, curMonth, 1).getDay();
  const daysInMon = new Date(curYear, curMonth+1, 0).getDate();
  const daysInPrev= new Date(curYear, curMonth, 0).getDate();

  // ── Gather tests (bright red dot, blinking if urgent) ──────────
  const tests = S.getAllTests();
  const eventMap = {}; // dateStr -> [{dotCls, kind, ...}]
  tests.forEach(t => {
    if (!eventMap[t.date]) eventMap[t.date] = [];
    const d = daysUntil(t.date);
    const dotCls = d >= 0 && d <= 7 ? 'dot-test-urgent' : 'dot-test';
    // avoid duplicate test dots on same date
    if (!eventMap[t.date].find(e => e.dotCls === dotCls && e.kind === 'test')) {
      eventMap[t.date].push({ dotCls, kind: 'test', label: t.name });
    }
  });

  // ── Gather tasks (one dot per unique subject per date) ──────────
  for (let i = -60; i <= 120; i++) {
    const d2 = new Date(); d2.setDate(d2.getDate() + i);
    const ds2 = d2.toISOString().split('T')[0];
    const tasks = S.getTasks(ds2);
    if (!tasks.length) continue;
    if (!eventMap[ds2]) eventMap[ds2] = [];
    const seenSubs = new Set(eventMap[ds2].filter(e=>e.kind==='task').map(e=>e.sub));
    tasks.forEach(t => {
      const sub = t.sub || 'gen';
      if (!seenSubs.has(sub)) {
        seenSubs.add(sub);
        eventMap[ds2].push({ dotCls: `dot-${sub}`, kind: 'task', sub });
      }
    });
  }

  // Conflict detection
  const banner = document.getElementById('conflictBanner');
  banner.innerHTML = '';
  const dateMap2 = {};
  tests.forEach(t => { if(!dateMap2[t.date]) dateMap2[t.date]=[]; dateMap2[t.date].push(t.name); });
  Object.entries(dateMap2).filter(([,v])=>v.length>1).forEach(([d,names]) => {
    const b = document.createElement('div');
    b.className = 'warning-banner';
    b.innerHTML = `⚠️ Tests coinciding on <strong>${formatDate(d)}</strong>: ${names.join(' & ')}`;
    banner.appendChild(b);
  });

  // Total cells: prev-month tail + current month + next-month fill
  const totalCells = Math.ceil((firstDay + daysInMon) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    let cellDate, otherMonth = false, dayNum;
    if (i < firstDay) {
      dayNum = daysInPrev - firstDay + 1 + i;
      const m = curMonth === 0 ? 11 : curMonth - 1;
      const y = curMonth === 0 ? curYear - 1 : curYear;
      cellDate = `${y}-${String(m+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      otherMonth = true;
    } else if (i - firstDay >= daysInMon) {
      dayNum = i - firstDay - daysInMon + 1;
      const m = curMonth === 11 ? 0 : curMonth + 1;
      const y = curMonth === 11 ? curYear + 1 : curYear;
      cellDate = `${y}-${String(m+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      otherMonth = true;
    } else {
      dayNum = i - firstDay + 1;
      cellDate = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    }

    const isToday    = cellDate === todayStr;
    const isSelected = cellDate === selectedDate;
    const isWeekend  = (i % 7 === 0) || (i % 7 === 6);
    const events     = eventMap[cellDate] || [];

    const cell = document.createElement('div');
    const classes = ['cal-cell'];
    if (otherMonth) classes.push('other-month');
    if (isToday)    classes.push('today');
    if (isSelected) classes.push('selected');
    if (isWeekend)  classes.push('weekend');
    cell.className = classes.join(' ');
    cell.dataset.date = cellDate;

    // Dots: tests first (red), then subject dots, max 6
    const dotHtml = events.slice(0, 6).map(e =>
      `<div class="cal-dot ${e.dotCls}"></div>`).join('');

    cell.innerHTML = `<div class="cal-num">${dayNum}</div>
      <div class="cal-dots">${dotHtml}</div>`;

    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      renderCalendar(); // re-render to update selected
      showDayPanel(cellDate);
    });

    grid.appendChild(cell);
  }
}

// ── Day detail panel ──────────────────────────────────────────────
function showDayPanel(ds) {
  const title  = document.getElementById('dayPanelTitle');
  const content= document.getElementById('dayPanelContent');
  const addBtn = document.getElementById('addTaskForDay');

  const d = new Date(ds + 'T00:00:00');
  title.textContent = `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  addBtn.style.display = 'inline-flex';
  addBtn.onclick = () => openAddTaskModal();

  const tests = S.getAllTests().filter(t => t.date === ds);
  const tasks  = S.getTasks(ds);
  const days   = daysUntil(ds);

  let html = '';

  // Tests
  tests.forEach(t => {
    const isJee = t.type === 'jee';
    const col   = isJee ? 'var(--blue)' : 'var(--green)';
    const badge = isJee ? 'badge-blue' : 'badge-green';
    const catLbl= t.jeeCategory ? { main:'JEE Main', advanced:'JEE Advanced', both:'Main+Adv', school:'School' }[t.jeeCategory] : (t.cbseType ? { ut:'Unit Test', half:'Half Yearly', preboard:'Pre-board', board:'Board', practical:'Practical' }[t.cbseType] : '');
    const dLabel= days < 0 ? 'Completed' : days === 0 ? '🔴 Today!' : `${days} days left`;
    html += `<div class="day-event-item" style="border-left:3px solid ${col};">
      <span class="day-event-icon">${isJee?'🎯':'📝'}</span>
      <span class="day-event-name">${t.name}</span>
      <span class="day-event-badge" style="background:${col}22;color:${col}">${catLbl||''}</span>
      <span style="font-size:.7rem;color:${days<=7&&days>=0?'var(--red)':days<=14&&days>=0?'var(--amber)':'var(--muted)'}">${dLabel}</span>
    </div>`;
  });

  // Tasks
  if (tasks.length) {
    html += `<div style="font-size:.72rem;font-weight:700;color:var(--muted);margin:10px 0 6px;text-transform:uppercase;letter-spacing:.06em;">Tasks</div>`;
    tasks.forEach(t => {
      const sub = {phy:'⚡ Physics',chem:'🧪 Chemistry',math:'∑ Math',eng:'📖 English',pe:'🏃 PE',gen:'📌 General'}[t.sub]||t.sub||'📌';
      html += `<div class="day-task-item">
        <div class="task-cb ${t.done?'done':''}" onclick="toggleTaskUI('${ds}','${t.id}')">${t.done?'✓':''}</div>
        <span class="task-text ${t.done?'done':''}">${t.title}</span>
        <span style="font-size:.68rem;color:var(--muted)">${sub}</span>
        <button class="btn-icon" style="font-size:.7rem" onclick="deleteTaskUI('${ds}','${t.id}')">✕</button>
      </div>`;
    });
  }

  if (!tests.length && !tasks.length) {
    html = `<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:16px;">No events on this day.<br><span style="color:var(--blue);cursor:pointer;font-weight:600;" onclick="openAddTaskModal()">+ Add a task</span></div>`;
  }

  content.innerHTML = html;
}

function toggleTaskUI(ds, id) {
  S.toggleTask(ds, id);
  renderCalendar();
  showDayPanel(ds);
}
function deleteTaskUI(ds, id) {
  S.deleteTask(ds, id);
  renderCalendar();
  showDayPanel(ds);
}

// ── Add Task ──────────────────────────────────────────────────────
function openAddTaskModal() {
  if (!selectedDate) { toast('Click a date on the calendar first!', 'info'); return; }
  const d = new Date(selectedDate + 'T00:00:00');
  const label = `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('addTaskDateLabel').innerHTML =
    `📅 Adding task for <strong style="color:var(--blue)">${label}</strong>`;
  document.getElementById('taskTitle').value = '';
  document.getElementById('addTaskModal').classList.add('open');
  setTimeout(() => document.getElementById('taskTitle').focus(), 100);
}
function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const sub   = document.getElementById('taskSub').value;
  const ds    = selectedDate;
  if (!title) { toast('Enter a task description', 'error'); return; }
  if (!ds)    { toast('Click a date first!', 'error'); return; }
  S.addTask(ds, { title, sub });
  closeModal('addTaskModal');
  renderCalendar();
  showDayPanel(ds);
  toast('Task added! ✅', 'success');
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

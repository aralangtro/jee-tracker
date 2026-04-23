// ─── AI API Calls ────────────────────────────────────────────────
const AI = {
  // Generic POST — keyType: 'vision' | 'reason'
  async post(endpoint, body, fileInput, keyType = 'reason') {
    const vk = S.getVisionKey();
    const rk = S.getReasonKey();
    const key = keyType === 'vision' ? (vk || rk) : (rk || vk);
    if (!key) {
      toast('Please set your NVIDIA NIM API Keys — click "API Key" in the sidebar.', 'error');
      throw new Error('No API key');
    }

    if (fileInput && fileInput.files[0]) {
      const fd = new FormData();
      fd.append('file', fileInput.files[0]);
      Object.entries(body).forEach(([k,v]) => fd.append(k, typeof v==='string'?v:JSON.stringify(v)));
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-vision-key': vk || rk, 'x-reason-key': rk || vk },
        body: fd
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Server error');
      return r.json();
    } else {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vision-key': vk || rk,
          'x-reason-key': rk || vk
        },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Server error');
      return r.json();
    }
  },

  // Vision model for file uploads, reason model for text
  async analyzeSyllabus(text, testType, fileInput = null) {
    const keyType = (fileInput && fileInput.files[0]) ? 'vision' : 'reason';
    return AI.post('/api/analyze-syllabus', { text, testType }, fileInput, keyType);
  },

  async analyzeMomentum() {
    const studyLogs  = S.getLast30Logs();
    const mockScores = S.getMockScores().slice(-10);
    const result = await AI.post('/api/analyze-momentum', { studyLogs, mockScores }, null, 'reason');
    S.setMomentum(result);
    return result;
  },

  async analyzeDailyLog({ date, sessions, subjects, description }) {
    const recentLogs = S.getLast30Logs().slice(-7);
    return AI.post('/api/analyze-daily-log', { date, sessions, subjects, description, recentLogs }, null, 'reason');
  },

  _chatHistory: [],
  resetChat() { AI._chatHistory = []; },

  async chat(message, testType = 'jee', syllabusContext = '') {
    // Limit history to last 6 messages (3 exchanges) to prevent payload bloat
    const history = AI._chatHistory.slice(-6).map(h => ({ role: h.role, text: h.text }));
    const result  = await AI.post('/api/chat', { message, testType, syllabusContext, history }, null, 'reason');
    AI._chatHistory.push({ role: 'user',  text: message });
    AI._chatHistory.push({ role: 'model', text: result.response });
    return result.response;
  }
};


// ─── Countdown Timer Renderer ────────────────────────────────────
function renderCountdown(targetDate, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  function update() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) {
      el.innerHTML = '<span style="color:var(--red);font-weight:700;">Test Day! 🎯</span>';
      return;
    }
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    el.innerHTML = `
      <div class="countdown">
        <div class="cd-unit"><span class="cd-num">${String(d).padStart(2,'0')}</span><span class="cd-label">Days</span></div>
        <span class="cd-sep">:</span>
        <div class="cd-unit"><span class="cd-num">${String(h).padStart(2,'0')}</span><span class="cd-label">Hrs</span></div>
        <span class="cd-sep">:</span>
        <div class="cd-unit"><span class="cd-num">${String(m).padStart(2,'0')}</span><span class="cd-label">Min</span></div>
        <span class="cd-sep">:</span>
        <div class="cd-unit"><span class="cd-num">${String(s).padStart(2,'0')}</span><span class="cd-label">Sec</span></div>
      </div>`;
  }
  update();
  return setInterval(update, 1000);
}

// ─── Chatbox Component ────────────────────────────────────────────
function initChatbox(containerId, testType, getSyllabusContext) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="chatbox">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:1.2rem;">🤖</span>
          <div>
            <div style="font-size:.85rem;font-weight:700;">AI Study Coach</div>
            <div style="font-size:.68rem;color:var(--muted);">JEE & CBSE Expert</div>
          </div>
        </div>
        <button class="btn-icon" onclick="AI.resetChat();initChatbox('${containerId}','${testType}',getSyllabusContext)" title="Clear chat">🗑</button>
      </div>
      <div class="chat-history" id="${containerId}_history">
        <div class="chat-msg ai">👋 Hi! I'm your AI study coach. Ask me about:<br>
        • Topic weightage in JEE/CBSE<br>
        • How to prepare specific topics<br>
        • Important formulas & shortcuts<br>
        • Time management strategies</div>
      </div>
      <div class="chat-input-row">
        <textarea class="chat-input" id="${containerId}_input" placeholder="Ask about topics, weightage, strategies..." rows="1" oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px';" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();sendChatMsg('${containerId}','${testType}')}"></textarea>
        <button class="btn btn-primary btn-sm" onclick="sendChatMsg('${containerId}','${testType}')" style="align-self: flex-end;">Send</button>
      </div>
    </div>`;

  window.getSyllabusContextFor = getSyllabusContext;
}

async function sendChatMsg(containerId, testType) {
  const input = document.getElementById(`${containerId}_input`);
  const history = document.getElementById(`${containerId}_history`);
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  input.style.height = 'auto';

  // Add user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user fade-in';
  userBubble.textContent = msg;
  history.appendChild(userBubble);

  // Add typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg ai fade-in';
  typing.innerHTML = '<span class="spinner"></span> Thinking...';
  history.appendChild(typing);
  history.scrollTop = history.scrollHeight;

  try {
    const ctx = typeof window.getSyllabusContextFor === 'function' ? window.getSyllabusContextFor() : '';
    const response = await AI.chat(msg, testType, ctx);
    typing.innerHTML = response.replace(/\n/g, '<br>');
  } catch (e) {
    typing.innerHTML = `❌ ${e.message}`;
    typing.style.color = 'var(--red)';
  }
  history.scrollTop = history.scrollHeight;
}

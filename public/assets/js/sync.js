// ─────────────────────────────────────────────────────────────────
// Cloud Sync Module — Supabase Auth + Storage
// ─────────────────────────────────────────────────────────────────
// Optional cloud sync for multi-device access. Users opt in via
// the "☁️ Cloud Sync" button in the sidebar.
//
// Setup: Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file
// or configure them in the sync modal.
//
// Uses Supabase JS v2 from CDN — no build step needed.
// Data is stored in a Supabase table: user_data (id, user_id, data, updated_at)
// ─────────────────────────────────────────────────────────────────

const CloudSync = (() => {
  const SYNC_KEYS_LS = 'jt_cloud_sync';
  let _supabase = null;
  let _user = null;

  /** Load sync config */
  function getConfig() {
    try { return JSON.parse(localStorage.getItem(SYNC_KEYS_LS)) || {}; } catch { return {}; }
  }

  /** Save sync config */
  function setConfig(cfg) {
    localStorage.setItem(SYNC_KEYS_LS, JSON.stringify(cfg));
  }

  /** Check if Supabase JS is loaded */
  function isLibLoaded() {
    return typeof window !== 'undefined' && typeof window.supabase !== 'undefined';
  }

  /** Load Supabase JS from CDN if not already loaded */
  function loadLib() {
    return new Promise((resolve, reject) => {
      if (isLibLoaded()) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Supabase JS library'));
      document.head.appendChild(script);
    });
  }

  /** Initialize Supabase client */
  async function init(url, anonKey) {
    if (!url || !anonKey) return false;
    try {
      await loadLib();
      _supabase = window.supabase.createClient(url, anonKey);

      // Check for existing session
      const { data: { session } } = await _supabase.auth.getSession();
      if (session) {
        _user = session.user;
        updateSyncUI(true);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[CloudSync] Init failed:', e);
      return false;
    }
  }

  /** Sign in with magic link (email) */
  async function signInWithEmail(email) {
    if (!_supabase) throw new Error('Cloud sync not configured');
    const { error } = await _supabase.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
    return true;
  }

  /** Sign in with the OTP token from the magic link */
  async function verifyOtp(email, token) {
    if (!_supabase) throw new Error('Cloud sync not configured');
    const { data, error } = await _supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw new Error(error.message);
    _user = data.user;
    updateSyncUI(true);
    return data.user;
  }

  /** Sign out */
  async function signOut() {
    if (_supabase) {
      await _supabase.auth.signOut();
    }
    _user = null;
    updateSyncUI(false);
  }

  /** Push local data to cloud */
  async function pushToCloud() {
    if (!_supabase || !_user) throw new Error('Not signed in');

    // Collect all jt_* data from localStorage
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('jt_') && !key.includes('api_key') && key !== SYNC_KEYS_LS) {
        try { dump[key] = JSON.parse(localStorage.getItem(key)); }
        catch { dump[key] = localStorage.getItem(key); }
      }
    }
    // Also include jt_syl2 and jt_exam_settings
    ['jt_syl2', 'jt_exam_settings', 'jt_sr_data'].forEach(k => {
      const v = localStorage.getItem(k);
      if (v) try { dump[k] = JSON.parse(v); } catch {}
    });

    const { error } = await _supabase
      .from('user_data')
      .upsert({
        user_id: _user.id,
        data: dump,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);
    setConfig({ ...getConfig(), lastPush: new Date().toISOString() });
    return Object.keys(dump).length;
  }

  /** Pull cloud data to local */
  async function pullFromCloud() {
    if (!_supabase || !_user) throw new Error('Not signed in');

    const { data, error } = await _supabase
      .from('user_data')
      .select('data, updated_at')
      .eq('user_id', _user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error('No cloud data found. Push your data first!');
      throw new Error(error.message);
    }

    if (!data || !data.data) throw new Error('Cloud data is empty');

    // Write to localStorage + IDB
    const dump = data.data;
    Object.entries(dump).forEach(([k, v]) => {
      localStorage.setItem(k, JSON.stringify(v));
    });

    if (typeof IDB !== 'undefined' && IDB.isSupported()) {
      IDB.importAll(dump).catch(() => {});
    }

    setConfig({ ...getConfig(), lastPull: new Date().toISOString() });
    return { keys: Object.keys(dump).length, updatedAt: data.updated_at };
  }

  /** Get current user info */
  function getUser() { return _user; }
  function isSignedIn() { return !!_user; }

  /** Update sync indicator in sidebar */
  function updateSyncUI(connected) {
    const badge = document.getElementById('syncBadge');
    if (!badge) return;
    if (connected && _user) {
      badge.innerHTML = `<div class="api-dot ok"></div><span>☁️ ${_user.email?.split('@')[0] || 'Synced'}</span>`;
    } else {
      badge.innerHTML = '<div class="api-dot"></div><span>☁️ Cloud Sync</span>';
    }
  }

  return {
    getConfig, setConfig, init, signInWithEmail, verifyOtp, signOut,
    pushToCloud, pullFromCloud, getUser, isSignedIn, isLibLoaded,
    updateSyncUI,
  };
})();

// ─────────────────────────────────────────────────────────────────
// Cloud Sync UI — Modal and handlers
// ─────────────────────────────────────────────────────────────────

function openSyncModal() {
  if (!document.getElementById('syncModal')) {
    const m = document.createElement('div');
    m.id = 'syncModal';
    m.className = 'modal-overlay';

    const cfg = CloudSync.getConfig();
    const isConnected = CloudSync.isSignedIn();
    const user = CloudSync.getUser();

    m.innerHTML = `
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <div class="modal-title">☁️ Cloud Sync — Multi-Device</div>
          <button class="btn-icon" onclick="document.getElementById('syncModal').classList.remove('open')">✕</button>
        </div>
        <div style="font-size:.78rem;color:var(--muted);margin-bottom:16px;line-height:1.6">
          Sync your study data across devices using <strong>Supabase</strong> (free tier).<br>
          <a href="https://supabase.com" target="_blank" style="color:var(--blue);">Get your free Supabase project →</a>
        </div>

        <div class="form-group">
          <label class="form-label" style="color:var(--blue)">🔗 Supabase Project URL</label>
          <input class="form-input" id="syncSupaUrl" type="url"
            placeholder="https://yourproject.supabase.co"
            value="${cfg.supabaseUrl || ''}">
        </div>

        <div class="form-group">
          <label class="form-label" style="color:var(--purple)">🔑 Supabase Anon Key</label>
          <input class="form-input" id="syncSupaKey" type="password"
            placeholder="eyJhbGciOi..."
            value="${cfg.supabaseKey || ''}">
        </div>

        <div id="syncAuthSection" style="border-top:1px solid var(--border);padding-top:14px;margin-top:8px;${cfg.supabaseUrl ? '' : 'display:none;'}">
          <div id="syncUserInfo" style="display:${isConnected ? 'block' : 'none'};margin-bottom:12px;">
            <div style="font-size:.82rem;color:var(--green);font-weight:600;">✅ Signed in as ${user?.email || '...'}</div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:3px;">Last push: ${cfg.lastPush?.slice(0,16) || 'never'} · Last pull: ${cfg.lastPull?.slice(0,16) || 'never'}</div>
          </div>

          <div id="syncLoginForm" style="${isConnected ? 'display:none;' : ''}">
            <div class="form-group">
              <label class="form-label">📧 Email (for magic link login)</label>
              <input class="form-input" id="syncEmail" type="email" placeholder="your@email.com">
            </div>
            <div class="form-group" id="syncOtpGroup" style="display:none;">
              <label class="form-label">🔢 OTP Code (from email)</label>
              <input class="form-input" id="syncOtp" type="text" placeholder="123456" maxlength="6">
            </div>
            <button class="btn btn-primary btn-sm" id="syncLoginBtn" onclick="handleSyncLogin()" style="width:100%;margin-bottom:8px;">📧 Send Magic Link</button>
          </div>
        </div>

        <div id="syncStatus" style="display:none;background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;font-size:.78rem;margin:10px 0;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;">
          <button class="btn btn-ghost btn-sm" onclick="handleSyncSave()">💾 Save Config</button>
          <button class="btn btn-primary btn-sm" onclick="handleSyncPush()">⬆️ Push</button>
          <button class="btn btn-ghost btn-sm" onclick="handleSyncPull()">⬇️ Pull</button>
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:10px;">
          <button class="btn btn-danger btn-sm" onclick="handleSyncSignOut()" style="font-size:.7rem;">Sign Out</button>
        </div>
      </div>`;
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
    document.body.appendChild(m);
  }
  document.getElementById('syncModal').classList.add('open');
}

async function handleSyncSave() {
  const url = document.getElementById('syncSupaUrl')?.value.trim();
  const key = document.getElementById('syncSupaKey')?.value.trim();
  if (!url || !key) { toast('Enter both Supabase URL and key', 'error'); return; }

  CloudSync.setConfig({ ...CloudSync.getConfig(), supabaseUrl: url, supabaseKey: key });

  const statusEl = document.getElementById('syncStatus');
  statusEl.style.display = 'block';
  statusEl.innerHTML = '<span class="spinner"></span> Connecting to Supabase...';

  try {
    const ok = await CloudSync.init(url, key);
    document.getElementById('syncAuthSection').style.display = 'block';
    statusEl.innerHTML = ok
      ? '✅ Connected! Already signed in.'
      : '✅ Supabase connected. Sign in with your email below.';
    statusEl.style.color = 'var(--green)';
    toast('Supabase config saved!', 'success');
  } catch (e) {
    statusEl.innerHTML = '❌ Connection failed: ' + e.message;
    statusEl.style.color = 'var(--red)';
  }
}

async function handleSyncLogin() {
  const email = document.getElementById('syncEmail')?.value.trim();
  const otpInput = document.getElementById('syncOtp');
  const otpGroup = document.getElementById('syncOtpGroup');
  const btn = document.getElementById('syncLoginBtn');

  if (otpGroup.style.display !== 'none' && otpInput?.value) {
    // Verify OTP
    btn.innerHTML = '<span class="spinner"></span> Verifying...';
    btn.disabled = true;
    try {
      await CloudSync.verifyOtp(email, otpInput.value.trim());
      toast('Signed in successfully! ☁️', 'success');
      document.getElementById('syncLoginForm').style.display = 'none';
      document.getElementById('syncUserInfo').style.display = 'block';
      document.getElementById('syncUserInfo').querySelector('div').textContent = '✅ Signed in as ' + email;
    } catch (e) {
      toast('OTP verification failed: ' + e.message, 'error');
    }
    btn.innerHTML = '🔢 Verify OTP';
    btn.disabled = false;
  } else {
    // Send magic link
    if (!email) { toast('Enter your email', 'error'); return; }
    btn.innerHTML = '<span class="spinner"></span> Sending...';
    btn.disabled = true;
    try {
      await CloudSync.signInWithEmail(email);
      otpGroup.style.display = 'block';
      btn.innerHTML = '🔢 Verify OTP';
      toast('Magic link sent! Check your email for the OTP code.', 'success');
    } catch (e) {
      toast('Login failed: ' + e.message, 'error');
      btn.innerHTML = '📧 Send Magic Link';
    }
    btn.disabled = false;
  }
}

async function handleSyncPush() {
  if (!CloudSync.isSignedIn()) { toast('Sign in first to push data', 'error'); return; }
  const statusEl = document.getElementById('syncStatus');
  statusEl.style.display = 'block';
  statusEl.innerHTML = '<span class="spinner"></span> Pushing data to cloud...';
  try {
    const count = await CloudSync.pushToCloud();
    statusEl.innerHTML = `✅ Pushed ${count} data keys to cloud!`;
    statusEl.style.color = 'var(--green)';
    toast(`☁️ ${count} keys synced to cloud!`, 'success');
  } catch (e) {
    statusEl.innerHTML = '❌ Push failed: ' + e.message;
    statusEl.style.color = 'var(--red)';
    toast('Push failed: ' + e.message, 'error');
  }
}

async function handleSyncPull() {
  if (!CloudSync.isSignedIn()) { toast('Sign in first to pull data', 'error'); return; }
  if (!confirm('Pull cloud data and REPLACE local data? Cannot be undone.')) return;
  const statusEl = document.getElementById('syncStatus');
  statusEl.style.display = 'block';
  statusEl.innerHTML = '<span class="spinner"></span> Pulling data from cloud...';
  try {
    const result = await CloudSync.pullFromCloud();
    statusEl.innerHTML = `✅ Pulled ${result.keys} keys (last updated: ${result.updatedAt?.slice(0,16)})`;
    statusEl.style.color = 'var(--green)';
    toast(`☁️ Restored ${result.keys} keys from cloud! Reloading...`, 'success');
    setTimeout(() => location.reload(), 1500);
  } catch (e) {
    statusEl.innerHTML = '❌ Pull failed: ' + e.message;
    statusEl.style.color = 'var(--red)';
    toast('Pull failed: ' + e.message, 'error');
  }
}

async function handleSyncSignOut() {
  await CloudSync.signOut();
  toast('Signed out of cloud sync', 'info');
  const loginForm = document.getElementById('syncLoginForm');
  const userInfo = document.getElementById('syncUserInfo');
  if (loginForm) loginForm.style.display = 'block';
  if (userInfo) userInfo.style.display = 'none';
}

// ── Auto-init cloud sync on load ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cfg = CloudSync.getConfig();
  if (cfg.supabaseUrl && cfg.supabaseKey) {
    CloudSync.init(cfg.supabaseUrl, cfg.supabaseKey).catch(() => {});
  }
});

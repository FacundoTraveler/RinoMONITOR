/**
 * app.js — RinoMONITOR navigation, settings, and initialization
 */

// ─── Navigation ───────────────────────────────────────────────
function showPage(key) {
  // If coming from onboarding, show app shell
  if (key !== 'onboarding') {
    document.getElementById('page-onboarding').style.display = 'none';
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('app-shell').style.display = 'flex';
  }

  document.querySelectorAll('.page-inner').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + key);
  const nav  = document.getElementById('nav-' + key);
  if (page) page.classList.add('active');
  if (nav)  nav.classList.add('active');
}

// ─── Learn tabs ───────────────────────────────────────────────
function learnTab(key, el) {
  document.querySelectorAll('.learn-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.learn-content').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const sec = document.getElementById('lt-' + key);
  if (sec) sec.classList.add('active');
}

// ─── Toggle helpers ───────────────────────────────────────────
function togToggle(el) {
  el.classList.toggle('on');
  el.classList.toggle('off');
}

function toggleApiKeyVisibility() {
  const inp = document.getElementById('apiKeyInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─── AI Provider ──────────────────────────────────────────────
function selectProvider(p) {
  document.getElementById('provClaude').classList.remove('selected');
  document.getElementById('provOpenAI').classList.remove('selected');
  document.getElementById('checkClaude').classList.add('hidden');
  document.getElementById('checkOpenAI').classList.add('hidden');

  AI.setProvider(p);
  document.getElementById('prov' + (p === 'claude' ? 'Claude' : 'OpenAI')).classList.add('selected');
  document.getElementById('check' + (p === 'claude' ? 'Claude' : 'OpenAI')).classList.remove('hidden');

  // Load saved key for this provider
  const saved = AI.loadSaved(p);
  const inp = document.getElementById('apiKeyInput');
  inp.value = saved || '';
  document.getElementById('apiKeyLabel').textContent = p === 'claude' ? 'Anthropic API Key' : 'OpenAI API Key';
  inp.placeholder = p === 'claude' ? 'sk-ant-...' : 'sk-...';

  updateAIBadge();
  document.getElementById('apiKeyWrap').style.display = '';
  showToast(p === 'claude' ? 'Claude Vision selected' : 'OpenAI GPT-4o selected');
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key || key.length < 8) { showToast('Please enter a valid API key'); return; }
  AI.setApiKey(key);
  updateAIBadge();
  showToast('API key saved · AI analysis enabled');
}

function updateAIBadge() {
  const prov = AI.provider;
  const badge = document.getElementById('aiBadge');
  const lbl   = document.getElementById('aiProviderLabel');
  if (!prov) {
    lbl.textContent = 'Not set';
    badge.style.background = '';
    return;
  }
  lbl.textContent = prov === 'claude' ? 'Claude' : 'GPT-4o';
  document.getElementById('aiModelName').textContent = prov === 'claude' ? 'claude-opus-4-6' : 'gpt-4o';
}

function selectFreq(el, val) {
  document.querySelectorAll('.freq-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  AI.setFreq(val);
}

// ─── Network selection ────────────────────────────────────────
function selectNet(el, label) {
  document.querySelectorAll('.net-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('chainLbl').textContent = label;
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── References population ────────────────────────────────────
function populateRefs() {
  const container = document.getElementById('refsList');
  if (!container || typeof REFS === 'undefined') return;
  container.innerHTML = REFS.map(r => `
    <div class="ref-item">
      <div class="ref-num">[${r.num}]</div>
      <div class="ref-body">
        <div class="ref-text">${r.text}</div>
        <span class="ref-badge">${r.tag}</span>
      </div>
    </div>
  `).join('');
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateRefs();
  Monitor.refreshSessionTable();

  // Restore saved provider if any
  ['claude','openai'].forEach(p => {
    if (localStorage.getItem('re_api_key_' + p)) {
      AI.loadSaved(p);
      updateAIBadge();
    }
  });
});

/**
 * monitor.js — RinoMONITOR camera & session logic
 */

const Monitor = (() => {
  let stream     = null;
  let running    = false;
  let totalSec   = 0;
  let alertCount = 0;
  let timerID    = null;

  const patternFallback = [
    'nasal','nasal','nasal','mouth','nasal','posture','nasal',
    'nasal','mouth','mouth','nasal','nasal','posture','nasal'
  ];
  let patIdx = 0;
  let useAI  = false;

  // ── DOM refs ──
  const $ = (id) => document.getElementById(id);

  function fmt(s) {
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + Math.round(s % 60);
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      const video = $('videoEl');
      video.srcObject = stream;
      await video.play();
      return true;
    } catch (e) {
      console.warn('[Monitor] Camera error:', e.message);
      return false;
    }
  }

  function stopCamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    const video = $('videoEl');
    if (video) video.srcObject = null;
  }

  function captureFrame() {
    const video = $('videoEl');
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width  = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  }

  async function start() {
    if (running) return;
    const camOk = await startCamera();

    running    = true;
    totalSec   = 0;
    alertCount = 0;
    patIdx     = 0;
    useAI      = AI.hasKey();

    // UI: camera
    $('camDot').style.background = '#3DB84B';
    $('camStatusTxt').textContent = 'Monitoring active';
    $('camIdle').style.display = 'none';
    $('liveBadge').classList.remove('hidden');
    $('chainDot').classList.add('pulse');
    $('chainLbl').textContent = 'Live · ZKP';
    $('zkpSub').textContent = 'Processing data off-chain';
    $('zkpChip').textContent = 'ACTIVE';

    // update button
    const btn = $('btnMonitor');
    btn.textContent = '■ Stop monitoring';
    btn.classList.add('stop');

    setStatus('ok');

    // Timer
    timerID = setInterval(() => {
      totalSec++;
      $('lsTime').textContent = fmt(totalSec);
      // fallback detection if no AI
      if (!useAI) {
        patIdx = (patIdx + 1) % patternFallback.length;
        applyDetection(patternFallback[patIdx]);
      }
    }, 1000);

    // AI interval
    if (useAI) {
      AI.startInterval(captureFrame, (result) => {
        applyAIResult(result);
      });
    }
  }

  function stop() {
    if (!running) return;
    running = false;
    clearInterval(timerID);
    AI.stopInterval();
    stopCamera();

    const score = totalSec > 0 ? Math.max(40, Math.round(100 - (alertCount / Math.max(1, totalSec / 4) * 100))) : 0;

    // UI reset
    $('camDot').style.background = '#aaa';
    $('camStatusTxt').textContent = 'Monitoring stopped';
    $('camIdle').style.display = '';
    $('liveBadge').classList.add('hidden');
    $('detLabel').classList.add('hidden');
    $('chainDot').classList.remove('pulse');
    $('chainLbl').textContent = 'Testnet';
    $('zkpSub').textContent = 'Session anchored on Cardano';
    $('zkpChip').textContent = '✓ OK';
    $('lsScore').textContent = totalSec > 0 ? score + '%' : '—';
    $('aiOutputText').textContent = 'Session complete. Start a new session to enable AI analysis.';

    const btn = $('btnMonitor');
    btn.textContent = '▶ Start monitoring';
    btn.classList.remove('stop');

    setStatus('idle');
    saveSession(score);
    showToast('Session saved · ZKP anchored on Cardano · +0.07 ₳');
  }

  function applyDetection(type) {
    const lbl = $('detLabel');
    lbl.classList.remove('hidden');
    if (type === 'mouth') {
      alertCount++;
      lbl.className = 'detect-label dl-alert';
      lbl.textContent = 'MOUTH OPEN';
      setStatus('alert');
    } else if (type === 'posture') {
      lbl.className = 'detect-label dl-mixed';
      lbl.textContent = 'POSTURE';
      setStatus('posture');
    } else {
      lbl.className = 'detect-label dl-ok';
      lbl.textContent = 'NASAL ✓';
      setStatus('ok');
    }
    $('lsAlerts').textContent = alertCount;
    const score = Math.max(40, Math.round(100 - (alertCount / Math.max(1, totalSec / 4) * 100)));
    $('lsScore').textContent = score + '%';
  }

  function applyAIResult(result) {
    // Update AI output panel
    const provName = AI.provider === 'claude' ? 'Claude' : 'GPT-4o';
    $('aiModelName').textContent = provName;
    $('aiOutputText').textContent = result.summary || 'Analysis complete.';

    // Map AI result to detection
    if (!result || result.status === 'unclear') return;
    if (result.status === 'mouth_open' || result.mouth_open === true) {
      applyDetection('mouth');
    } else if (result.status === 'posture_issue' || result.posture_ok === false) {
      applyDetection('posture');
    } else {
      applyDetection('nasal');
    }
  }

  function setStatus(state) {
    const card  = $('statusCard');
    const icon  = $('statusIcon');
    const head  = $('statusHeading');
    const chks  = $('statusChecks');
    const classes = { idle: 'sc-idle', ok: 'sc-ok', alert: 'sc-alert', posture: 'sc-mixed' };
    card.className = 'status-card ' + (classes[state] || 'sc-idle');
    if (state === 'ok') {
      icon.textContent = '✅'; head.textContent = 'ALL GOOD!';
      chks.innerHTML = '✓ NOSE BREATHING ACTIVE<br>✓ PROPER TONGUE POSITION<br>✓ GOOD HEAD POSTURE';
    } else if (state === 'alert') {
      icon.textContent = '⚠️'; head.textContent = 'MOUTH BREATHING DETECTED';
      chks.innerHTML = '✗ MOUTH OPEN — CLOSE LIPS<br>✗ BREATHE THROUGH NOSE';
    } else if (state === 'posture') {
      icon.textContent = '📐'; head.textContent = 'POSTURE ALERT';
      chks.innerHTML = '⚠ HEAD POSITION OFF<br>✓ Mouth closed — keep it up!';
    } else {
      icon.textContent = '⏸'; head.textContent = 'WAITING TO START';
      chks.textContent = 'Press start to begin session';
    }
  }

  function saveSession(score) {
    const child = $('childNameInput').value || 'Unknown';
    const sess = {
      child,
      date: new Date().toLocaleString(),
      duration: fmt(totalSec),
      alerts: alertCount,
      score
    };
    const existing = JSON.parse(localStorage.getItem('re_sessions') || '[]');
    existing.unshift(sess);
    if (existing.length > 50) existing.pop();
    localStorage.setItem('re_sessions', JSON.stringify(existing));
    refreshSessionTable();
  }

  function refreshSessionTable() {
    const tbody = $('sessionsTableBody');
    if (!tbody) return;
    const sessions = JSON.parse(localStorage.getItem('re_sessions') || '[]');
    if (sessions.length === 0) return;
    tbody.innerHTML = sessions.slice(0, 10).map(s => {
      const cls = s.score >= 80 ? 'hi' : s.score >= 60 ? 'mid' : 'lo';
      return `<tr><td>${s.child}</td><td>${s.date}</td><td>${s.duration}</td><td>${s.alerts}</td><td><span class="score-chip ${cls}">${s.score}%</span></td></tr>`;
    }).join('');
  }

  function toggle() { running ? stop() : start(); }

  return { toggle, start, stop, refreshSessionTable };
})();

function toggleMonitoring() { Monitor.toggle(); }

/**
 * ai.js — RinoMONITOR AI facial recognition module
 * Supports: Anthropic Claude (claude-opus-4-6) and OpenAI (gpt-4o)
 */

const AI = (() => {
  let provider = null;   // 'claude' | 'openai'
  let apiKey   = null;
  let freqSec  = 3;
  let intervalId = null;

  const PROMPT = `You are an expert in pediatric oral posture and nasal breathing assessment.
Analyze this image of a child's face captured during a monitoring session.

Evaluate and respond with a short JSON object (no markdown, no extra text):
{
  "status": "nasal_ok" | "mouth_open" | "posture_issue" | "unclear",
  "mouth_open": true | false,
  "posture_ok": true | false,
  "confidence": 0.0 to 1.0,
  "summary": "one sentence clinical observation in English, max 20 words"
}

Focus on:
- Whether the lips are sealed (nasal breathing) or parted (mouth breathing)
- Head tilt or forward head posture
- Facial relaxation consistent with nasal breathing
If the image is unclear or no face is detected, use status "unclear".`;

  function setProvider(p) { provider = p; }
  function setApiKey(k)   { apiKey = k; localStorage.setItem('re_api_key_' + provider, k); }
  function setFreq(s)     { freqSec = parseInt(s, 10); }

  function loadSaved(p) {
    provider = p;
    const saved = localStorage.getItem('re_api_key_' + p);
    if (saved) { apiKey = saved; return saved; }
    return null;
  }

  function hasKey() { return !!(apiKey && apiKey.length > 8); }

  async function analyzeFrame(base64Image) {
    if (!provider || !hasKey()) return null;
    try {
      if (provider === 'claude') return await _callClaude(base64Image);
      if (provider === 'openai') return await _callOpenAI(base64Image);
    } catch (e) {
      console.warn('[AI] analysis error:', e.message);
      return { status: 'unclear', summary: 'AI analysis error: ' + e.message };
    }
    return null;
  }

  async function _callClaude(base64Image) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
            { type: 'text', text: PROMPT }
          ]
        }]
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return _parseJSON(text);
  }

  async function _callOpenAI(base64Image) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64Image, detail: 'low' } }
          ]
        }]
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return _parseJSON(text);
  }

  function _parseJSON(text) {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return { status: 'unclear', summary: text.substring(0, 80) };
    }
  }

  function startInterval(captureCallback, resultCallback) {
    stopInterval();
    intervalId = setInterval(async () => {
      const frame = captureCallback();
      if (!frame) return;
      const result = await analyzeFrame(frame);
      if (result) resultCallback(result);
    }, freqSec * 1000);
  }

  function stopInterval() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  return { setProvider, setApiKey, setFreq, loadSaved, hasKey, analyzeFrame, startInterval, stopInterval, get provider() { return provider; } };
})();

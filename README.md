# RinoMONITOR

**Active Prevention for Respiratory Habit · Decentralized Medical Innovation on Cardano**

A web-based oral posture monitoring app with AI facial recognition, Cardano blockchain anchoring, and Midnight Zero-Knowledge Proof privacy.

---

## 🔬 Science

Built on **RinoEstomatología Pediátrica (RinoMONITOR)** — integrating Otolaryngology and Stomatology for early detection and prevention of mouth breathing and related craniofacial disorders in children.

Backed by **24 peer-reviewed scientific references** (2002–2025), including meta-analyses from BMC Oral Health, Frontiers in Public Health, and Nature Science Sleep.

---

## 🚀 Features

- **Live monitoring** via webcam — real-time oral posture detection
- **AI facial recognition** — choose between Claude (Anthropic) or GPT-4o (OpenAI)
- **Progress tracker** — session history, compliance score, improvement over time
- **Learn section** — scientifically validated educational content with 24 references
- **Blockchain privacy** — Cardano anchoring + Midnight ZKP (Zero-Knowledge Proofs)
- **ADA micropayments** — rewards per valid anchored session
- **Doctor DGA access** — encrypted data accessible only to authorized medical professionals
- **Full settings** — AI provider, detection sensitivity, alerts, network (Testnet/Mainnet)

---

## 🛠 Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/rinomonitor.git
cd rinomonitor
```

### 2. Open in browser

This is a pure frontend app — no build step required.

```bash
# Option A: Open directly
open index.html

# Option B: Serve locally (recommended for camera access)
npx serve .
# or
python3 -m http.server 3000
```

> **Note:** Camera access requires HTTPS or localhost. Use a local server.

### 3. Configure AI Provider

1. Open the app → go to **Settings**
2. Under **AI Provider**, select **Claude** or **OpenAI**
3. Paste your API key
4. Click **Save API key**

Your key is stored **only in your browser's localStorage** and sent exclusively to the selected AI provider.

#### Getting API keys

- **Anthropic (Claude):** https://console.anthropic.com/
- **OpenAI (GPT-4o):** https://platform.openai.com/api-keys

---

## 📁 Project structure

```
rinomonitor/
├── index.html          # Main app shell
├── css/
│   └── style.css       # Full stylesheet (CSS variables, responsive)
├── js/
│   ├── ai.js           # AI integration (Claude + OpenAI Vision API)
│   ├── monitor.js      # Camera, detection, session logic
│   ├── app.js          # Navigation, settings, init
│   └── refs.js         # 24 scientific references data
└── assets/
    └── favicon.svg     # RinoMONITOR logo
```

---

## 🤖 AI Integration

The AI module (`js/ai.js`) sends periodic camera frames to the selected vision API for analysis.

### Prompt
The model evaluates:
- **Lip seal** — nasal breathing vs. mouth open
- **Head posture** — forward head posture or tilt
- **Confidence score** (0–1)

### Response format (JSON)
```json
{
  "status": "nasal_ok | mouth_open | posture_issue | unclear",
  "mouth_open": false,
  "posture_ok": true,
  "confidence": 0.92,
  "summary": "Lips sealed, nasal breathing confirmed, head position normal."
}
```

### Models used
| Provider | Model |
|----------|-------|
| Anthropic | `claude-opus-4-6` |
| OpenAI | `gpt-4o` |

---

## ⛓ Blockchain Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| Anchoring | Cardano (Ouroboros PoS) | Immutable hash per session, ADA micropayments |
| Privacy | Midnight (ZKP sidechain) | Zero-Knowledge Proofs — raw data never exposed |
| Access | DGA protocol | Encrypted access for authorized doctors only |

---

## 👥 Team

| Role | Name |
|------|------|
| ENT / Medical Lead | Dr. Jesús Rangel |
| CTO | Dr. Claudio Hermida |
| CPO | Ing. Agustín Chermaz |
| CEO | Facundo Couto |

---

## 📄 License

MIT License — see `LICENSE` for details.

---

## 🔗 Links

- **Manifesto:** https://facundotraveler.github.io/rinoestoma.github.io/
- **Live demo:** https://rinoestomamonitor.vercel.app/
- **Cardano Catalyst F15:** Vote for RinoMONITOR

---

*RinoMONITOR v1.0 · Cardano Catalyst F15*

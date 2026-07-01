# JurisMind AI ⚖️

> **Multilingual Legal Intelligence & Decision Support Platform**
>
> An AI Legal Copilot that helps you understand, analyze, compare, and make informed decisions before signing legal documents.

---

## 🏗️ Milestone Progress

| Milestone | Status | Description |
|---|---|---|
| **M1** | ✅ Complete | Monorepo Foundation + Project Scaffold |
| M2 | 🔜 Pending | Authentication System |
| M3 | 🔜 Pending | Document Upload + Storage |
| M4 | 🔜 Pending | AI Service Core + Ingestion |
| M5 | 🔜 Pending | Document Analysis Pipeline |
| M6 | 🔜 Pending | Conversational RAG Engine |
| M7 | 🔜 Pending | Decision Support Engine |
| M8 | 🔜 Pending | Document Comparison |
| M9 | 🔜 Pending | Multilingual Support |
| M10 | 🔜 Pending | Polish + Production Deploy |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + TypeScript |
| **Styling** | Vanilla CSS (Design Tokens) |
| **Backend API** | Node.js + Fastify + TypeScript |
| **AI Service** | Python + FastAPI |
| **Database** | MongoDB Atlas |
| **Storage** | Cloudinary |
| **Auth** | JWT RS256 + Google OAuth |
| **LLM** | Gemini 2.5 Flash |
| **Vector DB** | FAISS |
| **OCR** | EasyOCR |
| **Translation** | IndicTrans2 + Gemini |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## 📁 Project Structure

```
jurismind-ai/
├── apps/
│   ├── web/              # React 19 + Vite SPA → Vercel
│   ├── api/              # Node.js + Fastify → Render
│   └── ai-service/       # Python + FastAPI → Render
├── packages/
│   ├── shared-types/     # TypeScript types shared across apps
│   └── shared-utils/     # Shared utility functions
├── scripts/              # Dev scripts (MongoDB init)
├── docker-compose.yml    # Local MongoDB
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml
```

---

## 🚀 Milestone 1 — Setup Instructions

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | >= 20.0.0 |
| pnpm | >= 9.0.0 |
| Python | >= 3.11 |
| Docker Desktop | Latest |

Install pnpm if needed:
```bash
npm install -g pnpm@9
```

---

### Step 1 — Clone and Install

```bash
# Navigate to project
cd c:\Users\rache\Downloads\JurisMind-AI

# Install all dependencies (all workspaces)
pnpm install
```

---

### Step 2 — Build Shared Packages

```bash
# Build shared-types first (other packages depend on it)
pnpm --filter @jurismind/shared-types build

# Build shared-utils
pnpm --filter @jurismind/shared-utils build
```

---

### Step 3 — Start Local MongoDB

```bash
# Start MongoDB via Docker Compose
docker compose up -d

# Verify it's running
docker compose ps
```

Expected output:
```
NAME                 STATUS    PORTS
jurismind_mongo      running   0.0.0.0:27017->27017/tcp
```

---

### Step 4 — Configure API Environment

```bash
# Copy the example env file
copy apps\api\.env.example apps\api\.env
```

For Milestone 1, the minimal required values are pre-filled for local dev.
You only need to generate JWT keys:

```bash
# Generate RSA key pair for JWT signing
node -e "
const { generateKeyPairSync } = require('crypto');
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log('JWT_PRIVATE_KEY=' + JSON.stringify(privateKey));
console.log('JWT_PUBLIC_KEY=' + JSON.stringify(publicKey));
"
```

Copy the output values into `apps/api/.env`.

---

### Step 5 — Configure AI Service Environment

```bash
copy apps\ai-service\.env.example apps\ai-service\.env
```

For Milestone 1, no Gemini key is needed — only health check endpoints are active.

---

### Step 6 — Configure Web Environment

```bash
copy apps\web\.env.example apps\web\.env
```

---

### Step 7 — Start All Services

Open **3 terminal windows**:

**Terminal 1 — API Server:**
```bash
cd apps\api
pnpm dev
```
Expected: `🚀 JurisMind API running on http://localhost:8000`

**Terminal 2 — AI Service:**
```bash
cd apps\ai-service

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn src.main:app --reload --port 8001
```
Expected: `🚀 AI Service ready on port 8001`

**Terminal 3 — Frontend:**
```bash
cd apps\web
pnpm dev
```
Expected: `Local: http://localhost:5173`

---

## ✅ Milestone 1 — Testing Steps

### 1. Test API Health

```bash
# Health check (should show MongoDB connected)
curl http://localhost:8000/api/v1/health

# Expected response:
# {"success":true,"data":{"status":"ok","version":"1.0.0","services":{"database":"connected"}}}
```

```bash
# Ping (liveness probe)
curl http://localhost:8000/api/v1/ping

# Expected response:
# {"pong":true,"ts":1234567890}
```

### 2. Test AI Service Health

```bash
# Health check
curl http://localhost:8001/ai/v1/health

# Ping
curl http://localhost:8001/ai/v1/ping
```

### 3. Test 404 Handling

```bash
curl http://localhost:8000/api/v1/nonexistent

# Expected:
# {"success":false,"error":{"code":"NOT_FOUND","message":"The requested endpoint does not exist."}}
```

### 4. Test Rate Limiting

```bash
# Run 101 requests rapidly (on Windows use a loop)
for ($i=1; $i -le 101; $i++) { curl -s http://localhost:8000/api/v1/ping | Out-Null }
curl http://localhost:8000/api/v1/ping
# Expected: 429 RATE_LIMITED after 100 requests
```

### 5. Test Frontend

Open `http://localhost:5173` — you should see the JurisMind AI landing page with:
- Dark theme with brand colors
- Navigation bar with logo
- Hero section with mock analysis card
- Features grid
- Green status bar at bottom

### 6. Test AI Service Swagger Docs (Dev only)

Open `http://localhost:8001/docs` — FastAPI auto-generated Swagger UI

---

## 🔧 Useful Commands

```bash
# Run all services in dev mode (from root)
pnpm dev

# Type-check all packages
pnpm type-check

# Build everything
pnpm build

# Clean all build outputs
pnpm clean

# Stop MongoDB
docker compose down

# Stop MongoDB + delete data
docker compose down -v
```

---

## 📋 Environment Variables Reference

### API (`apps/api/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_PRIVATE_KEY` | ✅ | RSA private key (PEM) for JWT signing |
| `JWT_PUBLIC_KEY` | ✅ | RSA public key (PEM) for JWT verification |
| `COOKIE_SECRET` | ✅ | 32+ char random string for cookie signing |
| `GOOGLE_CLIENT_ID` | M2 | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | M2 | Google OAuth client secret |
| `CLOUDINARY_*` | M3 | Cloudinary credentials |
| `AI_SERVICE_URL` | M4 | URL of the AI service |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |

### AI Service (`apps/ai-service/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GEMINI_API_KEY` | M4 | Google Gemini API key |
| `API_SERVICE_SECRET` | ✅ | Shared secret for API→AI auth |

---

## 🏛️ Architecture

See [`implementation_plan.md`](./docs/architecture.md) for the complete MVP v1.0 architecture.

---

## 📄 License

Private — JurisMind AI MVP v1.0

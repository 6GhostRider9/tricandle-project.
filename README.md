# TriCandle — 3-Candle Price Action Intelligence

A full-stack trading analytics platform. The **prediction model is unchanged** from your original Python code.

---

## Project Structure

```
tricandle/
├── backend/
│   ├── main.py              # FastAPI app — all API routes
│   ├── prediction_model.py  # *** YOUR 3-candle algorithm (unchanged) ***
│   ├── analysis.py          # Statistics: streaks, Markov, lookahead, etc.
│   ├── data_fetcher.py      # OANDA v20 REST API client
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── vite.config.js        # proxy /api → localhost:8000
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api.js            # fetch helpers + CSV export
        ├── store/
        │   └── useStore.js   # Zustand global state
        └── components/
            ├── Header.jsx
            ├── Sidebar.jsx   # data input panel
            ├── charts/
            │   └── Charts.jsx  # all Recharts wrappers + StatCard, Card, etc.
            └── tabs/
                ├── SetupTab.jsx
                ├── OverviewTab.jsx
                ├── SignalsTab.jsx
                ├── PatternsTab.jsx
                ├── ProbabilityTab.jsx
                ├── StreaksTab.jsx
                └── MultiTFTab.jsx
```

---

## Quick Start

### 1 — Backend

```bash
cd tricandle/backend

# create virtual env (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Backend is now live at http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

### 2 — Frontend

```bash
cd tricandle/frontend

npm install
npm run dev
```

Frontend opens at http://localhost:5173  
Vite proxies `/api/*` to the backend automatically — no CORS issues.

---

## Using the App

### Option A — OANDA Live/Practice Account
1. Go to **OANDA → My Account → Manage API Access** and generate a token.
2. In the left sidebar choose **OANDA API**, paste your token.
3. Select **Live** or **Practice** account type.
4. Pick any **Instrument** (forex pair, metal, index, crypto).
5. Pick a **Timeframe** OR check **"Analyze all timeframes"**.
6. Set candle count (50–5000) with the slider.
7. Press **▶ RUN ANALYSIS**.

### Option B — Upload CSV
1. Export OHLC data from MT4 / TradingView / any platform as CSV.
2. Required columns: `Date, Open, High, Low, Close` (case-insensitive).
3. Switch source to **CSV Upload**, drag-drop or browse for the file.
4. Press **▶ RUN ANALYSIS**.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/health`          | Health check |
| POST | `/upload-csv`      | Upload OHLC CSV file |
| POST | `/fetch-oanda`     | Fetch single TF from OANDA |
| POST | `/fetch-oanda-all` | Fetch all timeframes from OANDA |
| GET  | `/instruments`     | List supported pairs & TFs |

---

## Tabs

| Tab | What you get |
|-----|-------------|
| **Overview**    | Win rate, profit factor, expected value, equity curve, rolling win rate, pattern breakdown |
| **Signals**     | Every signal with date, pattern type, variant, result — filterable |
| **Patterns**    | 2/3/4-step lookahead grids, best/worst patterns by historical win rate |
| **Probability** | Markov transition matrix, conditional probabilities, after-streak stats |
| **Streaks**     | Max/avg win & loss streaks, streak distribution chart, after-3-streak stats |
| **Multi-TF**    | Side-by-side comparison of all timeframes (only when "all TF" is selected) |

---

## Prediction Model (UNCHANGED)

The algorithm in `backend/prediction_model.py` is a direct port of your original
`prediction_model.py`. No logic was changed:

- **Case 1**: C2 Close ≥ C1 High → Bull Breakout, target C2 High
- **Case 2**: C2 Close ≤ C1 Low  → Bear Breakout, target C2 Low
- **Case 3**: Green C1, C2 pierces high but closes inside → Bull Rejection, target C2 Low
- **Case 4**: Red C1,   C2 pierces low  but closes inside → Bear Rejection, target C2 High
- **Inside C1**: C2 fully inside C1 → skip
- **Inside Bar extension**: C3 inside C2 → use C4; double inside bar = 0

---

## Build for Production

```bash
# Frontend
cd tricandle/frontend
npm run build          # outputs to dist/

# Serve dist/ with any static host (Vercel, Netlify, nginx, etc.)
# Set VITE_API_URL env var or update vite.config.js proxy target
```

---

## Dependencies

**Backend**: FastAPI · Uvicorn · httpx · pandas · pydantic  
**Frontend**: React 18 · Vite · Recharts · Zustand · react-hot-toast · Tailwind CSS · Lucide React

"""
main.py – TriCandle FastAPI backend
Run:  uvicorn main:app --reload --port 8000
"""
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from prediction_model import three_candle_signals
from analysis import run_analysis
from data_fetcher import fetch_candles, fetch_all_timeframes, ALL_TIMEFRAMES

app = FastAPI(title="TriCandle API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────── helpers ──────────────────────────────────────────

def df_to_signals_and_analysis(df: pd.DataFrame, source_rows: int) -> dict:
    df = df.rename(columns={c: c.strip().title() for c in df.columns})
    required = {"Open", "High", "Low", "Close"}
    if not required.issubset(set(df.columns)):
        raise HTTPException(400, f"CSV must contain columns: {required}")

    for col in ["Open", "High", "Low", "Close"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["Open", "High", "Low", "Close"])
    df = df[df["High"] >= df["Low"]]
    df = df.reset_index(drop=True)

    if len(df) < 3:
        raise HTTPException(400, "Need at least 3 candles to generate signals.")

    signals = three_candle_signals(df)
    if not signals:
        raise HTTPException(400, "No 3-candle patterns found in the data.")

    analysis = run_analysis(signals)
    analysis["candle_count"] = len(df)
    analysis["source_rows"]  = source_rows
    return analysis


# ─────────────────────────── routes ───────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "TriCandle API"}


# ── 1. CSV upload ──────────────────────────────────────────────────────────────
@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(400, "Only .csv / .txt files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")

    result = df_to_signals_and_analysis(df, len(df))
    return {"success": True, "source": "csv", "filename": file.filename, **result}


# ── 2. OANDA single timeframe ─────────────────────────────────────────────────
class OandaRequest(BaseModel):
    api_key:      str
    instrument:   str  = Field(default="XAU_USD")
    granularity:  str  = Field(default="D")
    count:        int  = Field(default=500, ge=10, le=5000)
    account_type: str  = Field(default="live")  # "live" | "practice"


@app.post("/fetch-oanda")
async def fetch_oanda(req: OandaRequest):
    try:
        candles = await fetch_candles(
            req.api_key, req.instrument,
            req.granularity, req.count, req.account_type,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Fetch error: {e}")

    if not candles:
        raise HTTPException(400, "No completed candles returned from OANDA.")

    df = pd.DataFrame(candles)
    result = df_to_signals_and_analysis(df, len(df))
    return {
        "success": True,
        "source": "oanda",
        "instrument": req.instrument,
        "granularity": req.granularity,
        **result,
    }


# ── 3. OANDA all timeframes ───────────────────────────────────────────────────
class OandaAllRequest(BaseModel):
    api_key:      str
    instrument:   str  = Field(default="XAU_USD")
    count:        int  = Field(default=300, ge=10, le=2000)
    account_type: str  = Field(default="live")


@app.post("/fetch-oanda-all")
async def fetch_oanda_all(req: OandaAllRequest):
    try:
        tf_data = await fetch_all_timeframes(
            req.api_key, req.instrument, req.count, req.account_type,
        )
    except Exception as e:
        raise HTTPException(500, f"Fetch error: {e}")

    results = {}
    for tf, candles in tf_data.items():
        if isinstance(candles, dict) and "error" in candles:
            results[tf] = {"error": candles["error"]}
            continue
        if not candles:
            results[tf] = {"error": "No candles returned"}
            continue
        try:
            df = pd.DataFrame(candles)
            analysis = df_to_signals_and_analysis(df, len(df))
            results[tf] = {"success": True, **analysis}
        except Exception as e:
            results[tf] = {"error": str(e)}

    return {
        "success": True,
        "source": "oanda_all",
        "instrument": req.instrument,
        "timeframes": results,
    }


# ── 4. Supported instruments list ────────────────────────────────────────────
@app.get("/instruments")
def get_instruments():
    return {
        "majors":  ["EUR_USD","GBP_USD","USD_JPY","USD_CHF","AUD_USD","USD_CAD","NZD_USD"],
        "crosses": ["EUR_GBP","EUR_JPY","EUR_CHF","GBP_JPY","GBP_AUD","GBP_CHF",
                    "AUD_JPY","AUD_NZD","AUD_CAD","CAD_JPY","CHF_JPY","NZD_JPY"],
        "metals":  ["XAU_USD","XAG_USD","XPT_USD","XPD_USD"],
        "indices": ["US30_USD","SPX500_USD","NAS100_USD","UK100_GBP","DE30_EUR"],
        "crypto":  ["BTC_USD","ETH_USD","LTC_USD","XRP_USD"],
        "timeframes": ALL_TIMEFRAMES,
    }

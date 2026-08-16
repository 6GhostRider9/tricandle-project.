"""
data_fetcher.py – pulls OHLC candles from the OANDA v20 REST API
"""
import httpx
from typing import Optional

PRACTICE_BASE = "https://api-fxpractice.oanda.com/v3"
LIVE_BASE     = "https://api-fxtrade.oanda.com/v3"

GRAN_MAP = {
    "M1": "M1", "M5": "M5", "M15": "M15", "M30": "M30",
    "H1": "H1", "H4": "H4", "H12": "H12",
    "D": "D", "W": "W", "M": "M",
}

ALL_TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "H12", "D", "W", "M"]


async def fetch_candles(
    api_key: str,
    instrument: str,
    granularity: str,
    count: int = 500,
    account_type: str = "live",
) -> list[dict]:
    """
    Returns list of dicts: {Date, Open, High, Low, Close}
    Only completed candles are included.
    """
    base = PRACTICE_BASE if account_type == "practice" else LIVE_BASE
    gran = GRAN_MAP.get(granularity.upper(), "D")
    count = max(10, min(count, 5000))

    url = f"{base}/instruments/{instrument}/candles"
    params = {
        "count":       count,
        "granularity": gran,
        "price":       "M",   # mid prices
    }
    headers = {
        "Authorization":        f"Bearer {api_key}",
        "Content-Type":         "application/json",
        "Accept-Datetime-Format": "UNIX",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params, headers=headers)

    if resp.status_code != 200:
        detail = resp.text[:300] if resp.text else resp.reason_phrase
        raise ValueError(f"OANDA error {resp.status_code}: {detail}")

    data = resp.json()
    candles = []
    for c in data.get("candles", []):
        if not c.get("complete"):
            continue
        mid = c["mid"]
        # format date as YYYY-MM-DD
        from datetime import datetime, timezone
        ts = float(c["time"])
        dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        candles.append({
            "Date":  dt,
            "Open":  float(mid["o"]),
            "High":  float(mid["h"]),
            "Low":   float(mid["l"]),
            "Close": float(mid["c"]),
        })
    return candles


async def fetch_all_timeframes(
    api_key: str,
    instrument: str,
    count: int = 300,
    account_type: str = "live",
) -> dict[str, list[dict]]:
    """Fetch candles for every supported timeframe (sequentially to avoid rate limits)."""
    results = {}
    for tf in ALL_TIMEFRAMES:
        try:
            candles = await fetch_candles(api_key, instrument, tf, count, account_type)
            results[tf] = candles
        except Exception as e:
            results[tf] = {"error": str(e)}
    return results

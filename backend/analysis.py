"""
analysis.py – full statistical analysis of signal results
"""
from collections import Counter
from typing import Any


# ─────────────────────────────── helpers ──────────────────────────────────────

def _get_streaks(data: list[int], value: int) -> list[int]:
    streaks, count = [], 0
    for x in data:
        if x == value:
            count += 1
        else:
            if count > 0:
                streaks.append(count)
            count = 0
    if count > 0:
        streaks.append(count)
    return streaks or [0]


def _conditional_prob(data: list[int]) -> dict:
    c11 = c10 = c01 = c00 = 0
    for i in range(len(data) - 1):
        a, b = data[i], data[i + 1]
        if   a == 1 and b == 1: c11 += 1
        elif a == 1 and b == 0: c10 += 1
        elif a == 0 and b == 1: c01 += 1
        else:                   c00 += 1
    return {
        "p11": c11 / (c11 + c10) if (c11 + c10) else 0,
        "p10": c10 / (c11 + c10) if (c11 + c10) else 0,
        "p01": c01 / (c01 + c00) if (c01 + c00) else 0,
        "p00": c00 / (c01 + c00) if (c01 + c00) else 0,
        "c11": c11, "c10": c10, "c01": c01, "c00": c00,
    }


def _n_step_prob(data: list[int], n: int) -> dict:
    wins: dict[str, int] = {}
    total: dict[str, int] = {}
    for i in range(len(data) - n):
        key = "".join(map(str, data[i:i + n]))
        wins[key]  = wins.get(key, 0)  + data[i + n]
        total[key] = total.get(key, 0) + 1
    return {
        k: {
            "prob":  round(wins[k] / total[k], 4),
            "wins":  wins[k],
            "count": total[k],
        }
        for k in total
    }


def _equity_curve(data: list[int]) -> list[int]:
    curve, cum = [0], 0
    for v in data:
        cum += 1 if v == 1 else -1
        curve.append(cum)
    return curve


def _max_drawdown(equity: list[int]) -> int:
    peak, dd = 0, 0
    for v in equity:
        if v > peak: peak = v
        dd = max(dd, peak - v)
    return dd


def _rolling_wr(data: list[int], window: int = 20) -> list[float]:
    return [
        round(sum(data[i - window: i]) / window * 100, 1)
        for i in range(window, len(data) + 1)
    ]


def _after_n_streak(data: list[int], val: int, n: int) -> float | None:
    cnt = wins_after = 0
    for i in range(n, len(data)):
        if all(data[i - j - 1] == val for j in range(n)):
            cnt += 1
            if data[i] == 1:
                wins_after += 1
    return round(wins_after / cnt * 100, 1) if cnt else None


def _streak_distribution(data: list[int]) -> dict:
    ws = _get_streaks(data, 1)
    ls = _get_streaks(data, 0)
    wc = Counter(ws)
    lc = Counter(ls)
    keys = sorted(set(wc) | set(lc))
    return {
        "labels": keys,
        "win_counts":  [wc.get(k, 0) for k in keys],
        "loss_counts": [lc.get(k, 0) for k in keys],
    }


def _pattern_performance(signals: list[dict]) -> list[dict]:
    perf: dict[str, dict] = {}
    for s in signals:
        p = s["pattern"]
        if p not in perf:
            perf[p] = {"wins": 0, "total": 0}
        perf[p]["total"] += 1
        if s["result"] == 1:
            perf[p]["wins"] += 1
    return [
        {
            "label": k,
            "wins":  v["wins"],
            "total": v["total"],
            "rate":  round(v["wins"] / v["total"] * 100, 1),
        }
        for k, v in perf.items()
    ]


# ──────────────────────────────── main ────────────────────────────────────────

def run_analysis(signals: list[dict]) -> dict[str, Any]:
    data    = [s["result"] for s in signals]
    total   = len(data)
    wins    = sum(data)
    losses  = total - wins
    wr      = round(wins / total, 4) if total else 0

    ws = _get_streaks(data, 1)
    ls = _get_streaks(data, 0)

    cp      = _conditional_prob(data)
    p2      = _n_step_prob(data, 2)
    p3      = _n_step_prob(data, 3)
    p4      = _n_step_prob(data, 4)

    all_p   = {**p2, **p3, **p4}
    sorted_p = sorted(all_p.items(), key=lambda x: x[1]["prob"], reverse=True)

    equity  = _equity_curve(data)
    mdd     = _max_drawdown(equity)
    rolling = _rolling_wr(data, window=20)

    pf      = round(wins / losses, 3) if losses else float("inf")
    ev      = round(wr - (1 - wr), 3)          # assumes 1:1 RR

    def recent_wr(n):
        sl = data[-n:] if len(data) >= n else data
        return round(sum(sl) / len(sl) * 100, 1) if sl else 0

    return {
        # ─── core stats ───
        "total":   total,
        "wins":    wins,
        "losses":  losses,
        "win_rate": wr,
        "profit_factor": pf,
        "expected_value": ev,
        "max_drawdown": mdd,
        # ─── streak ───
        "max_win_streak":  max(ws),
        "avg_win_streak":  round(sum(ws) / len(ws), 2),
        "max_loss_streak": max(ls),
        "avg_loss_streak": round(sum(ls) / len(ls), 2),
        "streak_dist": _streak_distribution(data),
        "after_3_wins":   _after_n_streak(data, 1, 3),
        "after_3_losses": _after_n_streak(data, 0, 3),
        # ─── probability ───
        "conditional": cp,
        "p2": p2, "p3": p3, "p4": p4,
        "best5":  [{"pattern": k, **v} for k, v in sorted_p[:5]],
        "worst5": [{"pattern": k, **v} for k, v in sorted_p[-5:]],
        # ─── charts ───
        "equity_curve": equity,
        "rolling_wr":   rolling,
        "pattern_perf": _pattern_performance(signals),
        # ─── recent ───
        "recent_10": recent_wr(10),
        "recent_20": recent_wr(20),
        "recent_50": recent_wr(50),
        # ─── raw ───
        "signals": signals,
        "binary_string": "".join(map(str, data)),
    }

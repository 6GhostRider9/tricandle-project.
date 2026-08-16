import pandas as pd


def three_candle_signals(df: pd.DataFrame) -> list[dict]:
    """
    Apply extended 3-candle setup rules.
    Input : DataFrame with columns ['Date','Open','High','Low','Close']
    Output: list of dicts  {index, date, result(1/0), pattern, variant}

    *** PREDICTION MODEL IS UNCHANGED FROM ORIGINAL ***
    """
    signals = []
    i = 0

    while i < len(df) - 2:
        c1 = df.iloc[i]
        c2 = df.iloc[i + 1]
        c3 = df.iloc[i + 2]

        # -------- CASE 1  (breakout) --------
        if c2["Close"] >= c1["High"]:
            target = "high"
            target_val = c2["High"]
            pat = "Bull Breakout"

        elif c2["Close"] <= c1["Low"]:
            target = "low"
            target_val = c2["Low"]
            pat = "Bear Breakout"

        # -------- CASE 2  (rejection) --------
        elif (c1["Close"] > c1["Open"]
              and c2["High"] > c1["High"]
              and c2["Close"] < c1["High"]):
            target = "low"
            target_val = c2["Low"]
            pat = "Bull Rejection"

        elif (c1["Close"] < c1["Open"]
              and c2["Low"] < c1["Low"]
              and c2["Close"] > c1["Low"]):
            target = "high"
            target_val = c2["High"]
            pat = "Bear Rejection"

        # -------- CASE 3  (inside bar of C1 → skip) --------
        elif c2["High"] < c1["High"] and c2["Low"] > c1["Low"]:
            i += 1
            continue

        else:
            i += 1
            continue

        # -------- CHECK: is C3 an inside bar of C2? --------
        if c3["High"] <= c2["High"] and c3["Low"] >= c2["Low"]:
            if i + 3 < len(df):
                c4 = df.iloc[i + 3]

                # C4 also inside → double inside bar → fail
                if c4["High"] <= c2["High"] and c4["Low"] >= c2["Low"]:
                    signals.append({
                        "index": i,
                        "date": str(c3.get("Date", "")),
                        "result": 0,
                        "pattern": pat,
                        "variant": "IB×2",
                    })
                    i += 2
                    continue

                win = ((target == "high" and c4["High"] > target_val) or
                       (target == "low"  and c4["Low"]  < target_val))
                signals.append({
                    "index": i,
                    "date": str(c4.get("Date", "")),
                    "result": 1 if win else 0,
                    "pattern": pat,
                    "variant": "Inside Bar",
                })
            else:
                break
            i += 2
            continue

        # -------- NORMAL CHECK --------
        win = ((target == "high" and c3["High"] >= target_val) or
               (target == "low"  and c3["Low"]  <= target_val))
        signals.append({
            "index": i,
            "date": str(c3.get("Date", "")),
            "result": 1 if win else 0,
            "pattern": pat,
            "variant": "Normal",
        })
        i += 1

    return signals

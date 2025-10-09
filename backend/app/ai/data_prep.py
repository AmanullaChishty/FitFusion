import pandas as pd
from datetime import timedelta
from ..services.supabase_client import supabase
from app.core.auth import get_current_user


def load_user_data( start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    Prepare ML-ready dataset by aggregating workouts and progress data for a user.
    """
    # 1️⃣ Fetch workout and progress data
    user_id = get_current_user()["id"]
    workouts_resp = supabase.table("workouts").select("*").eq("user_id", user_id).execute()
    progress_resp = supabase.table("progress").select("*").eq("user_id", user_id).execute()

    workouts = workouts_resp.data or []
    progress = progress_resp.data or []

    if not workouts or not progress:
        print("⚠️ No workout or progress data found.")
        return pd.DataFrame()

    workouts_df = pd.DataFrame(workouts)
    progress_df = pd.DataFrame(progress)

    # 2️⃣ Normalize column names and datatypes
    workouts_df.rename(columns={"exercise_name": "exercise", "created_at": "date"}, inplace=True)
    workouts_df["exercise"] = workouts_df["exercise"].str.strip().str.lower()
    workouts_df["date"] = pd.to_datetime(workouts_df["date"])
    workouts_df["weight"] = workouts_df["weight"].fillna(0)
    workouts_df["reps"] = workouts_df["reps"].fillna(0)
    workouts_df["sets"] = workouts_df["sets"].fillna(0)

    # 3️⃣ Compute per-session metrics
    workouts_df["session_volume"] = workouts_df["weight"] * workouts_df["reps"] * workouts_df["sets"]
    workouts_df["est_1rm"] = workouts_df["weight"] * (1 + workouts_df["reps"] / 30)

    session_features = (
        workouts_df.groupby(["user_id", "date", "exercise"])
        .agg(
            session_volume=("session_volume", "sum"),
            sets=("sets", "sum"),
            reps=("reps", "sum"),
            weight=("weight", "mean"),
            est_1rm=("est_1rm", "mean"),
        )
        .reset_index()
    )

    # 4️⃣ Add rolling aggregates per exercise
    session_features = session_features.sort_values(["exercise", "date"])
    session_features["rolling_7d_volume"] = (
        session_features.groupby("exercise")["session_volume"]
        .transform(lambda x: x.rolling(window=7, min_periods=1).mean())
    )
    session_features["rolling_28d_volume"] = (
        session_features.groupby("exercise")["session_volume"]
        .transform(lambda x: x.rolling(window=28, min_periods=1).mean())
    )

    # 5️⃣ Merge with progress table (weight, body fat)
    progress_df["date"] = pd.to_datetime(progress_df["date"])
    merged = pd.merge_asof(
        session_features.sort_values("date"),
        progress_df.sort_values("date"),
        on="date",
        by="user_id",
        direction="nearest"
    )

    # 6️⃣ Compute delta in body weight (change from 7 days ago)
    merged = merged.sort_values("date")
    merged["delta_body_weight"] = merged["body_weight"] - merged["body_weight"].shift(7)

    # 7️⃣ Final dataset columns
    final_df = merged[
        [
            "user_id",
            "date",
            "exercise",
            "session_volume",
            "sets",
            "reps",
            "weight",
            "est_1rm",
            "rolling_7d_volume",
            "rolling_28d_volume",
            "body_weight",
            "body_fat_pct",
            "delta_body_weight",
        ]
    ].fillna(0)

    return final_df


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate ML-ready dataset for a user.")
    parser.add_argument("--out", default="/tmp/user_dataset.csv")
    args = parser.parse_args()

    df = load_user_data()
    if not df.empty:
        df.to_csv(args.out, index=False)
        print(f"✅ Dataset written to {args.out} ({len(df)} rows)")
    else:
        print("⚠️ No data found for this user.")

# backend/app/ai/fitness_advisor.py

import os
import pandas as pd
import numpy as np
from app.ai.data_prep import load_user_data
from typing import Dict, Any
import json
import openai 

# Setup OpenAI client (replace with Bedrock if using AWS)
openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are an expert strength and conditioning coach.
Given structured training history, identify progressive overload opportunities, fatigue risks,
and personalized next-session adjustments.

Always output valid JSON in the following schema:
{
  "recommendations": [
    {
      "exercise": "string",
      "current_weight": "float",
      "suggestion": {"type": "increase_weight|increase_reps|maintain|recovery", "value": "float|null"},
      "confidence": "float",
      "rationale": "string"
    }
  ],
  "summary": "string (brief reasoning about trends and recovery)"
}
"""

def summarize_recent_data(df: pd.DataFrame) -> str:
    """Generate a compact text summary of last 2-4 weeks for the LLM."""
    last_28 = df.sort_values("date").tail(28)
    summary_parts = []
    for ex, sub in last_28.groupby("exercise"):
        vol_change = (sub["session_volume"].iloc[-1] - sub["session_volume"].iloc[0]) / (sub["session_volume"].iloc[0] + 1e-6)
        # avg_rpe = sub["avg_rpe"].tail(3).mean() , avg RPE {avg_rpe:.1f}
        trend = "upward" if vol_change > 0.1 else "stable" if abs(vol_change) < 0.05 else "downward"
        summary_parts.append(f"{ex}: {trend} volume trend ({vol_change:.1%})")
    return "; ".join(summary_parts)

async def generate_ai_recommendations() -> Dict[str, Any]:
    """
    Unified AI workflow:
    - Load and preprocess data
    - Summarize into LLM-readable context
    - Query LLM for intelligent recommendations
    """

    df = load_user_data()
    if df.empty:
        return {"error": "No workout data found."}

    # Step 1: Summarize trends
    text_summary = summarize_recent_data(df)

    # Step 2: Prepare compact feature table (last row per exercise)
    latest_df = df.sort_values("date").groupby("exercise").tail(1)
    stats_json = latest_df.to_dict(orient="records")

    # Step 3: Compose LLM prompt
    user_prompt = f"""
User workout summary for analysis:
{text_summary}

Detailed recent data (JSON):
{json.dumps(stats_json, indent=2)}

Generate recommendations in JSON format as per schema.
"""

    # Step 4: LLM call
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=800
    )

    raw_output = response.choices[0].message["content"]

    # Step 5: Parse and return
    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError:
        data = {"error": "Failed to parse AI output", "raw": raw_output}

    return data

if __name__ == "__main__":
    import asyncio
    import argparse
    parser = argparse.ArgumentParser()
    args = parser.parse_args()

    result = asyncio.run(generate_ai_recommendations())
    print(json.dumps(result, indent=2))

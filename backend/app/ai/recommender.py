import os
import asyncio,json,re,time
import logging
from openai import AsyncOpenAI,OpenAIError
from openai._exceptions import APIStatusError
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv

from app.ai.data_prep import aggregate_exercise_history
from app.ai.fitness_advisor import (
    should_increase_weight,
    should_increase_reps,
    should_increase_sets,
    recovery_adjustment,
    build_suggestion_payload
)

# ---------------------------------------------------
# Setup & Configuration
# ---------------------------------------------------
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
client = AsyncOpenAI(api_key=api_key)

# ---------------------------------------------------
# Pydantic Schemas for Validation
# ---------------------------------------------------
class OverloadSuggestion(BaseModel):
    exercise_name: str
    suggested_action: str  # e.g. 'increase_weight', 'increase_reps', 'maintain', etc.
    numeric_recommendation: Optional[str] = None
    confidence: float
    rationale: str
    coaching_cues: Optional[List[str]] = []


class NextWorkoutSuggestion(BaseModel):
    user_id: str
    exercise_name: str
    base_suggestion: Dict[str, Any]
    enriched_suggestion: Optional[Dict[str, Any]] = None


# ---------------------------------------------------
# LLM Enrichment Template
# ---------------------------------------------------
SYSTEM_PROMPT = """You are an expert strength coach.
Given a user's exercise trend data, suggest conservative, safe progressive-overload recommendations
and a short coaching rationale.
Return ONLY valid JSON matching the provided schema.
Never recommend >10% weight increase at once and avoid recommending increases if recent RPE > 8.5.
"""

USER_PROMPT_TEMPLATE = """
Given the following exercise trend data:
{EXERCISE_TREND_JSON}

and a base suggestion:
{BASE_PAYLOAD_JSON}

and user's profile:
{USER_PROFILE_JSON}

Return ONLY a JSON object with keys:
- "exercise"
- "suggestion_type" ("increase_weight","increase_reps","add_set","deload","maintain","technique_focus","equipment_change")
- "value" (number)
- "confidence_score" (float 0..1)
- "rationale" (<= 50 words)
"""
JSON_FENCE = re.compile(r'```(?:json)?(.*?)```', re.DOTALL)

def extract_json(text: str) -> str:
    """
    Be lenient: prefer fenced JSON if present; else first {...} block.
    """
    m = JSON_FENCE.search(text)
    if m:
        return m.group(1).strip()
    # fallback to first top-level JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end+1]
    return text  # let json.loads fail loudly

# simple in-memory fuse to avoid spamming the API for a while after a quota error
_QUOTA_FUSE_UNTIL: float = 0.0
_QUOTA_COOLDOWN_SEC = 900  # 15 minutes

def quota_blocked() -> bool:
    return time.time() < _QUOTA_FUSE_UNTIL

def trip_quota_fuse():
    global _QUOTA_FUSE_UNTIL
    _QUOTA_FUSE_UNTIL = time.time() + _QUOTA_COOLDOWN_SEC

# ---------------------------------------------------
# Core Orchestration Functions
# ---------------------------------------------------
async def llm_enhance_suggestion(
    base_payload: Dict[str, Any],
    exercise_trend: Dict[str, Any],
    user_profile: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Refine rule-based suggestions with an LLM for nuance and coaching cues.
    Returns a validated JSON response or None if LLM fails.
    """
    if quota_blocked():
        logger.warning("LLM disabled due to recent insufficient_quota; returning base payload.")
        return base_payload

    # (1) Align the prompt with YOUR pydantic model's fields
    # If your OverloadSuggestion expects these keys:
    #   exercise, suggestion_type, value, confidence_score, rationale
    # then ask the model for EXACTLY these keys.
    prompt = USER_PROMPT_TEMPLATE.format(
        EXERCISE_TREND_JSON=json.dumps(exercise_trend, indent=2),
        BASE_PAYLOAD_JSON=json.dumps(base_payload, indent=2),
        USER_PROFILE_JSON=json.dumps(user_profile, indent=2)
    )

    backoff = 1.0
    for attempt in range(3):
        try:
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=400,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
            return OverloadSuggestion(**data).model_dump()

        except APIStatusError as e:
            # 429 covers rate limit AND insufficient_quota; check payload to branch
            if e.status_code == 429:
                err = None
                try:
                    err = e.response.json().get("error", {})
                except Exception:
                    pass
                code = (err or {}).get("code")
                if code == "insufficient_quota":
                    logger.error("OpenAI insufficient_quota: disabling LLM temporarily.")
                    trip_quota_fuse()
                    return base_payload  # degrade gracefully
                # true rate limit: backoff + retry
                await asyncio.sleep(backoff)
                backoff *= 2
                continue
            else:
                logger.error(f"OpenAI API error {e.status_code}: {e}")
                break

        except OpenAIError as e:
            logger.error(f"OpenAIError: {e}")
            await asyncio.sleep(backoff)
            backoff *= 2

        except Exception as e:
            logger.error(f"Unexpected LLM error: {e}")
            await asyncio.sleep(backoff)
            backoff *= 2

    # if all attempts fail for transient reasons, fall back
    return base_payload


async def generate_recommendation_for_exercise(user_id: str, exercise_name: str,
                                               user_profile: Optional[Dict[str, Any]] = None) -> NextWorkoutSuggestion:
    """
    1. Aggregate exercise trend data.
    2. Apply deterministic rule-based logic.
    3. Optionally enhance with LLM.
    """
    resp = await aggregate_exercise_history(user_id, exercise_name)
    # print(f"Aggregated trend for {resp['exercise_name']}: {resp['trend_metrics']}", flush=True)
    # metrics = trend.get("metrics", {})
    

    # Step 1: Base rule-based suggestion
    base_suggestion = await build_suggestion_payload(resp['exercise_name'], resp['trend_metrics'])
    # print(f"Base suggestion for {exercise_name}: {base_suggestion}", flush=True)

    # Step 2: Optionally call LLM if confidence < threshold or maintain
    enriched_suggestion = None
    if base_suggestion["confidence_score"] < 0.75 or base_suggestion["suggestion_type"] == "maintain":
        logger.info(f"Skipping LLM for {exercise_name} (low priority suggestion)")
    else:
        enriched_suggestion = await llm_enhance_suggestion(base_suggestion, resp['trend_metrics'], user_profile or {})

    # Step 3: Fallback handling
    if not enriched_suggestion:
        enriched_suggestion = base_suggestion
    print(f"Generated recommendation for {exercise_name}: {enriched_suggestion}", flush=True)

    return NextWorkoutSuggestion(
        user_id=user_id,
        exercise_name=exercise_name,
        base_suggestion=base_suggestion,
        enriched_suggestion=enriched_suggestion
    )


async def get_next_workout_suggestions_for_user(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Pulls user's most recent exercises and generates top-N suggestions.
    """
    # TODO: integrate with DB or cached list of user's frequent exercises
    # recent_exercises = ["Bicep Curl","bench_press", "squat", "pull_up", "shoulder_press", "deadlift"][:limit]


    results = []
    for ex in ["Bicep Curl"]:
        try:
            suggestion = await generate_recommendation_for_exercise(user_id, ex)
            results.append(suggestion.model_dump())
        except Exception as e:
            logger.error(f"Failed to generate suggestion for {ex}: {e}")
    print("Generated next workout suggestions:", results)
    return results


# ---------------------------------------------------
# CLI Testing Hook
# ---------------------------------------------------
if __name__ == "__main__":
    import argparse
    import asyncio

    parser = argparse.ArgumentParser()
    parser.add_argument("--user_id", required=True)
    parser.add_argument("--exercise", default="bench_press")
    args = parser.parse_args()

    async def main():
        result = await generate_recommendation_for_exercise(args.user_id, args.exercise)
        print(json.dumps(result.dict(), indent=2))

    asyncio.run(main())

import os
import json
import asyncio
import logging
import openai
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ValidationError

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
openai.api_key = os.getenv("OPENAI_API_KEY")
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

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

produce a JSON object with keys:
`exercise_name`, `suggested_action` ('increase_weight'|'increase_reps'|'increase_sets'|'maintain'|'deload'|'reduce_intensity'),
`numeric_recommendation` (e.g. '+2.5kg' or '+2 reps'),
`confidence` (0-1 float),
`rationale` (string, max 50 words),
`coaching_cues` (list of short strings).
"""

# ---------------------------------------------------
# Core Orchestration Functions
# ---------------------------------------------------
async def llm_enhance_suggestion(base_payload: Dict[str, Any],
                                 exercise_trend: Dict[str, Any],
                                 user_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Refine rule-based suggestions with an LLM for nuance and coaching cues.
    Returns a validated JSON response or None if LLM fails.
    """
    prompt = USER_PROMPT_TEMPLATE.format(
        EXERCISE_TREND_JSON=json.dumps(exercise_trend, indent=2),
        BASE_PAYLOAD_JSON=json.dumps(base_payload, indent=2),
        USER_PROFILE_JSON=json.dumps(user_profile, indent=2)
    )

    for attempt in range(3):
        try:
            response = await asyncio.to_thread(openai.ChatCompletion.create,
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            raw = response.choices[0].message["content"].strip()
            data = json.loads(raw)
            validated = OverloadSuggestion(**data)
            return validated.dict()
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"LLM response invalid on attempt {attempt+1}: {e}")
            await asyncio.sleep(2 * (attempt + 1))
        except Exception as e:
            logger.error(f"Unexpected LLM error: {e}")
            await asyncio.sleep(2 * (attempt + 1))
    return None


async def generate_recommendation_for_exercise(user_id: str, exercise_name: str,
                                               user_profile: Optional[Dict[str, Any]] = None) -> NextWorkoutSuggestion:
    """
    1. Aggregate exercise trend data.
    2. Apply deterministic rule-based logic.
    3. Optionally enhance with LLM.
    """
    trend = await aggregate_exercise_history(user_id, exercise_name)
    metrics = trend.get("metrics", {})

    # Step 1: Base rule-based suggestion
    base_suggestion = await build_suggestion_payload(trend)

    # Step 2: Optionally call LLM if confidence < threshold or maintain
    enriched_suggestion = None
    if base_suggestion["confidence_score"] < 0.75 or base_suggestion["action"] == "maintain":
        logger.info(f"Skipping LLM for {exercise_name} (low priority suggestion)")
    else:
        enriched_suggestion = await llm_enhance_suggestion(base_suggestion, trend, user_profile or {})

    # Step 3: Fallback handling
    if not enriched_suggestion:
        enriched_suggestion = base_suggestion

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
    recent_exercises = ["bench_press", "squat", "pull_up", "shoulder_press", "deadlift"][:limit]

    results = []
    for ex in recent_exercises:
        try:
            suggestion = await generate_recommendation_for_exercise(user_id, ex)
            results.append(suggestion.dict())
        except Exception as e:
            logger.error(f"Failed to generate suggestion for {ex}: {e}")

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

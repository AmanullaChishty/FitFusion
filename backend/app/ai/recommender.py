"""
AI service placeholder for progressive overload suggestions.

Later, this can be replaced with a real ML/LLM model that
analyzes workout history trends.
"""

from typing import Dict

def suggest_progressive_overload(last_workout: Dict) -> Dict:
    """
    Suggests how to progress based on the last workout.
    Simple rule-based placeholder:
    - If user completed all sets & reps easily, increase weight.
    - Otherwise, keep the same load.

    Args:
        last_workout (Dict): Example
            {
              "exercise": "Bench Press",
              "sets": 3,
              "reps": 10,
              "weight": 40,
              "completed": True
            }

    Returns:
        Dict: Suggestion
    """
    suggestion = last_workout.copy()
    if last_workout.get("completed", False):
        suggestion["weight"] = (last_workout.get("weight") or 0) + 2.5
        suggestion["note"] = "Increase weight slightly."
    else:
        suggestion["note"] = "Repeat same weight until all sets completed."

    return suggestion

# backend/ai/recommender.py

from typing import List, Dict

def generate_recommendations(workouts: List[Dict]) -> List[Dict]:
    """
    Placeholder recommendation logic.
    For now, it just suggests +2.5kg if a user has logged 3+ consistent sessions of the same exercise.
    """
    recommendations = []
    exercise_counts = {}

    for w in workouts:
        exercise = w.get("exercise")
        if not exercise:
            continue
        exercise_counts[exercise] = exercise_counts.get(exercise, 0) + 1

    for exercise, count in exercise_counts.items():
        if count >= 3:
            recommendations.append({
                "exercise": exercise,
                "suggestion": f"Increase weight by +2.5kg for {exercise}",
            })
        else:
            recommendations.append({
                "exercise": exercise,
                "suggestion": f"Stay consistent with {exercise}",
            })

    return recommendations

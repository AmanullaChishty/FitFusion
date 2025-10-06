# backend/ai/recommender.py

from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

def generate_recommendations(
    workouts: List[Dict],
    rolling_averages: Optional[Dict] = None,
    daily_totals: Optional[List[Dict]] = None,
    body_weight: Optional[float] = None,
    maintenance_calories: Optional[float] = None,
) -> Dict:
    """
    Generate training, nutrition, and recovery recommendations based on
    workout patterns and recent nutrition metrics.
    Deterministic rule-based system (no ML yet).
    """
    recommendations = []
    metrics_used = {}

    # --- Workout trend logic (existing simple rule) ---
    exercise_counts = {}
    for w in workouts or []:
        exercise = w.get("exercise")
        if not exercise:
            continue
        exercise_counts[exercise] = exercise_counts.get(exercise, 0) + 1

    for exercise, count in exercise_counts.items():
        if count >= 3:
            recommendations.append({
                "type": "training",
                "message": f"Increase weight by +2.5 kg for {exercise}",
                "rationale": "You’ve performed this exercise consistently (3+ sessions).",
                "actionable": {"increase_weight": True, "percent": 5, "add_rest_day": False}
            })
        else:
            recommendations.append({
                "type": "training",
                "message": f"Stay consistent with {exercise}",
                "rationale": "Not enough recent sessions to justify overload yet.",
                "actionable": {"increase_weight": False, "percent": 0, "add_rest_day": False}
            })

    # --- Nutrition & recovery analysis ---
    if rolling_averages and body_weight and maintenance_calories:
        calories_avg = rolling_averages.get("calories_avg")
        protein_avg = rolling_averages.get("protein_avg")
        fats_avg = rolling_averages.get("fats_avg")
        carbs_avg = rolling_averages.get("carbs_avg")

        protein_per_kg = protein_avg / body_weight if body_weight else None
        metrics_used = {
            "calories_avg": calories_avg,
            "protein_avg": protein_avg,
            "protein_per_kg": protein_per_kg,
            "fats_avg": fats_avg,
            "carbs_avg": carbs_avg,
            "maintenance_calories": maintenance_calories,
        }

        # Rule 1: Low protein intake
        if protein_per_kg is not None and protein_per_kg < 1.6:
            recommendations.append({
                "type": "nutrition",
                "message": "Increase daily protein intake.",
                "rationale": f"Current protein per kg ({protein_per_kg:.2f}) is below optimal (1.6 g/kg).",
                "actionable": {"increase_protein_g": round((1.6 - protein_per_kg) * body_weight), "add_rest_day": False}
            })

        # Rule 2: Calorie deficit with high training frequency
        total_sessions = len(workouts or [])
        if calories_avg and calories_avg < (maintenance_calories - 300) and total_sessions >= 4:
            recommendations.append({
                "type": "recovery",
                "message": "You may be under-recovering. Consider adding a rest day or mild deload.",
                "rationale": f"Caloric intake ({calories_avg:.0f}) is below maintenance ({maintenance_calories}) during high training load ({total_sessions} sessions).",
                "actionable": {"increase_weight": False, "add_rest_day": True}
            })

        # Rule 3: Calorie surplus but stagnant progress → overload suggestion
        if calories_avg and calories_avg >= (maintenance_calories + 300) and total_sessions >= 3:
            recommendations.append({
                "type": "training",
                "message": "Consider progressive overload — increase load by 2-5%.",
                "rationale": f"Calorie intake is above maintenance, indicating recovery capacity for higher training stress.",
                "actionable": {"increase_weight": True, "percent": 5, "add_rest_day": False}
            })

    # --- Logging (numeric only, anonymized) ---
    try:
        logger.info("Generated recommendations (no sensitive data): %s", metrics_used)
    except Exception:
        pass

    return {"recommendations": recommendations, "metrics_used": metrics_used}


// frontend/src/types/ai.ts

/**
 * Represents a single performed exercise session.
 */
export interface ExerciseSession {
  session_id: string;
  performed_at: string; // ISO date string
  total_volume: number; // sum of weight * reps
  top_set_weight: number;
  avg_rpe?: number | null;
  reps_distribution: number[];
}

/**
 * Trend analysis of an exercise over multiple sessions.
 */
export interface ExerciseTrend {
  exercise_name: string;
  lookback_sessions: number[]; // e.g., [4,8,12]
  sessions: ExerciseSession[];
  metrics: {
    volume_slope: number;
    top_set_slope: number;
    rpe_trend: number;
    consistency: number; // 0-1 scale
  };
}

/**
 * Rule-based or LLM-generated progressive overload suggestion.
 */
export interface OverloadSuggestion {
  recommendation: "increase_load" | "maintain" | "deload" | "recovery";
  suggested_delta: number; // e.g., +5 for kg, -10 for % reduction
  rationale: string;
  coaching_cues: string[];
  confidence: number; // 0-100 for frontend display
}

/**
 * Next workout suggestion for a user, to display in the dashboard card.
 */
export interface NextWorkoutSuggestionResponse {
  exercise_name: string;
  base_suggestion: Record<string, any>;
  enriched_suggestion: Record<string, any>;
}


/**
 * Example usage:
 * const suggestion: NextWorkoutSuggestionResponse = {
 *   exercise_name: "bench_press",
 *   action: "+2.5 kg",
 *   rationale: "RPE < 7 and volume trending up",
 *   confidence: 85,
 *   coaching_cues: ["Keep elbows tucked", "Focus on controlled descent"],
 *   is_recovery: false,
 * };
 */

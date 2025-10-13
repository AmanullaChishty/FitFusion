import api from "./api";
import { type NextWorkoutSuggestionResponse, type ExerciseTrend, type OverloadSuggestion } from "../types/ai";

/**
 * Fetch top N AI-generated next workout suggestions for a user.
 */
export const getNextWorkoutSuggestions = async (
  userId: string,
  limit: number = 5
): Promise<NextWorkoutSuggestionResponse[]> => {
  try {
    const response = await api.get(`/api/ai/next-workout`, {
      params: { user_id: userId, limit },
    });
    return response.data as NextWorkoutSuggestionResponse[];
  } catch (error) {
    console.error("Error fetching AI next workout suggestions:", error);
    return [];
  }
};

/**
 * Analyze a single exercise for a user: returns trend + overload suggestion.
 */
export const analyzeExercise = async (
  userId: string,
  exerciseName: string,
  lookback: number = 12
): Promise<{ trend: ExerciseTrend; suggestion: OverloadSuggestion } | null> => {
  try {
    const response = await api.post(`/api/ai/analyze-exercise`, {
      user_id: userId,
      exercise_name: exerciseName,
      lookback,
    });
    return response.data as { trend: ExerciseTrend; suggestion: OverloadSuggestion };
  } catch (error) {
    console.error(`Error analyzing exercise ${exerciseName}:`, error);
    return null;
  }
};

/**
 * Fetch top performed exercises for a user.
 */
export const getUserExercises = async (userId: string): Promise<string[]> => {
  try {
    const response = await api.get(`/api/ai/exercises/${userId}`);
    return response.data as string[];
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    return [];
  }
};

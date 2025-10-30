import api from "./api";
import { type NextWorkoutSuggestionResponse, type ExerciseTrend, type OverloadSuggestion } from "../types/ai";

/**
 * Fetch top N AI-generated next workout suggestions for a user.
 */
export const getNextWorkoutSuggestions = async (token:string,
  limit: number = 5
): Promise<NextWorkoutSuggestionResponse[]> => {
  try {
    const response = await api.get(`/api/ai/next-workout`, {
      params: {limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetched AI next workout suggestions:", response.data);
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
  token:string,
  exerciseName: string,
  lookback: number = 12
): Promise<{ trend: ExerciseTrend; suggestion: OverloadSuggestion } | null> => {
  // console.log(`token ${token} Analyzing exercise ${exerciseName}`);
  try {
    const response = await api.post(
      `/api/ai/analyze-exercise`,
      { exercise_name: exerciseName, lookback }, 
      {headers: {Authorization: `Bearer ${token}` },}
    );
    // console.log(`Analysis for exercise ${exerciseName}:`, response);
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

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL as string;

export interface Workout {
  id?: string;
  exercise: string;
  reps: number;
  sets: number;
}

export interface Recommendation {
  exercise: string;
  suggestion: string;
}

export const fetchWorkouts = async (token: string): Promise<Workout[]> => {
  const res = await axios.get<Workout[]>(`${API_URL}/workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchRecommendations = async (
  token: string
): Promise<{ user_id: string; recommendations: Recommendation[] }> => {
  const res = await axios.get<{ user_id: string; recommendations: Recommendation[] }>(
    `${API_URL}/recommendations`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

const api = axios.create({
  baseURL: API_URL || "http://localhost:8000", // fallback
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

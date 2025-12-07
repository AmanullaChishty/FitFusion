import api from "./api";

export interface Workout {
  id?: string;
  exercise_name: string;
  reps: number;
  sets: number;
  weight?: number | null;
  created_at?: Date;
}

// Create workout
export async function createWorkout(token: string, data: Workout): Promise<Workout> {
  const res = await api.post<Workout>("/api/workouts/", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Get workouts (optionally filter by date)
export async function getWorkouts(token: string, filterDate?: string): Promise<Workout[]> {
  const url = filterDate ? `api/workouts/?date_filter=${filterDate}` : "api/workouts/";
  const res = await api.get<Workout[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetched workouts:", res);
  return res.data;
}

// Get workout by ID
export async function getWorkoutById(token: string, id: string): Promise<Workout> {
  const res = await api.get<Workout>(`/api/workouts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Update workout
export async function updateWorkout(
  token: string,
  id: string,
  data: Partial<Workout>
): Promise<Workout> {
  const res = await api.put<Workout>(`/api/workouts/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Delete workout
export async function deleteWorkout(token: string, id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/api/workouts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// frontend/src/services/mealService.ts
import api from "./api";

export interface MealCreate {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_items: Record<string, any>[] | string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  date: string; // ISO date string
}

export interface MealUpdate {
  meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
  food_items?: Record<string, any>[] | string[];
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  date?: string;
}

export interface MealOut extends MealCreate {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface DailyTotals {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
}

export interface RollingAveragesResponse {
  avg_calories: number;
  avg_protein_g: number;
  avg_carbs_g: number;
  avg_fats_g: number;
}

/**
 * Create a new meal entry
 */
export const createMeal = async (
  token: string,
  meal: MealCreate
): Promise<MealOut> => {
  const res = await api.post<MealOut>("/api/meals", meal, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Update an existing meal
 */
export const updateMeal = async (
  token: string,
  mealId: string,
  updateData: MealUpdate
): Promise<MealOut> => {
  const res = await api.put<MealOut>(`/api/meals/${mealId}`, updateData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Delete a meal
 */
export const deleteMeal = async (token: string, mealId: string): Promise<void> => {
  await api.delete(`/api/meals/${mealId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Fetch all meals for a user on a given date
 */
export const getMealsByDate = async (
  token: string,
  userId: string,
  date: string
): Promise<MealOut[]> => {
  const res = await api.get<MealOut[]>(`/api/meals/${userId}/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Get daily totals between two dates
 */
export const getDailyTotals = async (
  token: string,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyTotals[]> => {
  const res = await api.get<DailyTotals[]>(
    `/api/meals/${userId}/totals?start_date=${startDate}&end_date=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

/**
 * Get rolling averages for calories/macros
 */
export const getRollingAverages = async (
  token: string,
  userId: string,
  days: number = 7
): Promise<RollingAveragesResponse> => {
  const res = await api.get<RollingAveragesResponse>(
    `/api/meals/${userId}/averages?days=${days}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export default {
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByDate,
  getDailyTotals,
  getRollingAverages,
};

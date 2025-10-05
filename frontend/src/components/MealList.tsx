import { useEffect, useState } from "react";
import { getMealsByDate, deleteMeal } from "../services/mealService";
import toast from "react-hot-toast";

interface MealListProps {
  date: string;
  refreshKey?: number;
  user_id: string;
}

export default function MealList({ date, refreshKey, user_id }: MealListProps) {
  const [meals, setMeals] = useState<any[]>([]);

  const loadMeals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await getMealsByDate(token, date,user_id);
      setMeals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meals");
    }
  };

  useEffect(() => {
    loadMeals();
  }, [date, refreshKey]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await deleteMeal(token, id);
    toast.success("Meal deleted");
    loadMeals();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Meals on {date}</h2>
      {meals.length === 0 ? (
        <p>No meals logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {meals.map((meal) => (
            <li key={meal.id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{meal.meal_type}</p>
                <p className="text-sm text-gray-600">{meal.food_items.join(", ")}</p>
                <p className="text-sm">Calories: {meal.calories} kcal</p>
              </div>
              <button
                onClick={() => handleDelete(meal.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

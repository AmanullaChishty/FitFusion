import { useEffect, useState } from "react";
import { getMealsByDate, deleteMeal } from "../services/mealService";
import toast from "react-hot-toast";

interface MealListProps {
  date: string;
  refreshKey?: number;
}

export default function MealList({ date, refreshKey }: MealListProps) {
  const [meals, setMeals] = useState<any[]>([]);

  const loadMeals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await getMealsByDate(token, date);
      console.log("Fetched meals:", data);
      setMeals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meals");
    }
  };

  useEffect(() => {
    loadMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await deleteMeal(token, id);
      toast.success("Meal deleted");
      loadMeals();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete meal");
    }
  };

  const formattedDate = new Date(date).toLocaleDateString();

  const mealTypeMeta: Record<
    string,
    { label: string; badge: string }
  > = {
    breakfast: { label: "Breakfast", badge: "🍳" },
    lunch: { label: "Lunch", badge: "🥗" },
    dinner: { label: "Dinner", badge: "🍽️" },
    snack: { label: "Snack", badge: "🍎" },
  };

  const formatMealType = (type: string) => {
    const meta = mealTypeMeta[type] || {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      badge: "🍽️",
    };
    return meta;
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Meals
          </h2>
          <p className="text-xs text-slate-500">On {formattedDate}</p>
        </div>
        {meals.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {meals.length} logged
          </span>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-500">
          No meals logged for this day yet.
          <br />
          <span className="text-xs text-slate-400">
            Log a meal to see it appear here.
          </span>
        </div>
      ) : (
        <ul className="space-y-3">
          {meals.map((meal) => {
            const { label, badge } = formatMealType(meal.meal_type);

            return (
              <li
                key={meal.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm">
                      {badge}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {label}
                    </p>
                  </div>

                  {/* Food items */}
                  <div className="space-y-1">
                    {meal.food_items?.map((item:any, index:number) => (
                      <p
                        key={index}
                        className="text-xs text-slate-600"
                      >
                        <span className="font-medium">{item.item}</span>
                        <span className="text-slate-400"> · </span>
                        <span>{item.qty}</span>
                      </p>
                    ))}
                  </div>

                  {/* Macros */}
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1">
                      <span className="mr-1 text-[10px]">🔥</span>
                      {meal.calories} kcal
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1">
                      <span className="mr-1 text-[10px]">💪</span>
                      {meal.protein_g} g protein
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1">
                      <span className="mr-1 text-[10px]">⚡</span>
                      {meal.carbs_g} g carbs
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1">
                      <span className="mr-1 text-[10px]">🥑</span>
                      {meal.fats_g} g fats
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                  >
                    ✕ Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

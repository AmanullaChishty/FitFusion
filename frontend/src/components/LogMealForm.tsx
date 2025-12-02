import { useState } from "react";
import { createMeal } from "../services/mealService";
import toast from "react-hot-toast";

interface LogMealFormProps {
  onMealAdded: () => void;
}

export default function LogMealForm({ onMealAdded }: LogMealFormProps) {
  const [form, setForm] = useState({
    meal_type: "breakfast",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [foodItems, setFoodItems] = useState([{ qty: "", item: "" }]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFoodItemChange = (
    index: number,
    field: "qty" | "item",
    value: string
  ) => {
    const newItems = [...foodItems];
    newItems[index][field] = value;
    setFoodItems(newItems);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, { qty: "", item: "" }]);
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      const validFoodItems = foodItems.filter(
        (f) => f.qty.trim() !== "" && f.item.trim() !== ""
      );

      if (validFoodItems.length === 0) {
        toast.error("Please add at least one food item.");
        setLoading(false);
        return;
      }

      await createMeal(token, {
        ...form,
        meal_type: form.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        food_items: validFoodItems,
        calories: parseInt(form.calories),
        protein_g: parseFloat(form.protein_g),
        carbs_g: parseFloat(form.carbs_g),
        fats_g: parseFloat(form.fats_g),
      });

      toast.success("Meal logged successfully!");
      setForm({
        ...form,
        calories: "",
        protein_g: "",
        carbs_g: "",
        fats_g: "",
      });
      setFoodItems([{ qty: "", item: "" }]);
      onMealAdded();
    } catch (err) {
      console.error(err);
      toast.error("Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  const macroFields = ["calories", "protein_g", "carbs_g", "fats_g"] as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Log a meal
        </h2>
        {form.date && (
          <p className="text-xs font-medium text-slate-500">
            {new Date(form.date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Meal Type & Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            Meal type
          </label>
          <select
            name="meal_type"
            value={form.meal_type}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Food Items */}
      <div className="space-y-2 rounded-xl bg-slate-50/80 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-slate-800">
            Food items
          </label>
          <button
            type="button"
            onClick={addFoodItem}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            + Add food item
          </button>
        </div>

        <div className="space-y-2">
          {foodItems.map((fi, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2.5 sm:flex-row sm:items-center sm:gap-3"
            >
              <input
                type="text"
                placeholder="Qty (e.g. 150g)"
                value={fi.qty}
                onChange={(e) =>
                  handleFoodItemChange(index, "qty", e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-1/3"
              />
              <input
                type="text"
                placeholder="Item (e.g. fish)"
                value={fi.item}
                onChange={(e) =>
                  handleFoodItemChange(index, "item", e.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:flex-1"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeFoodItem(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 text-xs font-semibold text-red-500 hover:border-red-200 hover:bg-red-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="grid gap-4 sm:grid-cols-2">
        {macroFields.map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-sm font-medium text-slate-800">
              {field === "calories"
                ? "Calories"
                : field === "protein_g"
                ? "Protein (g)"
                : field === "carbs_g"
                ? "Carbs (g)"
                : "Fats (g)"}
            </label>
            <input
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              min={0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading ? "Logging..." : "Log meal"}
      </button>
    </form>
  );
}

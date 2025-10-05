import { useState } from "react";
import { createMeal } from "../services/mealService";
import toast from "react-hot-toast";

interface LogMealFormProps {
  onMealAdded: () => void;
}

export default function LogMealForm({ onMealAdded }: LogMealFormProps) {
  const [form, setForm] = useState({
    meal_type: "breakfast",
    food_items: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      await createMeal(token, {
        ...form,
        meal_type: form.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        food_items: form.food_items.split(",").map((item) => item.trim()),
        calories: parseInt(form.calories),
        protein_g: parseFloat(form.protein_g),
        carbs_g: parseFloat(form.carbs_g),
        fats_g: parseFloat(form.fats_g),
      });

      toast.success("Meal logged successfully!");
      setForm({ ...form, food_items: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });
      onMealAdded();
    } catch (err) {
      console.error(err);
      toast.error("Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow space-y-3">
      <h2 className="text-xl font-semibold">Log a Meal</h2>
      <div>
        <label className="block mb-1 font-medium">Meal Type</label>
        <select
          name="meal_type"
          value={form.meal_type}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Food Items (comma-separated)</label>
        <textarea
          name="food_items"
          value={form.food_items}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded p-2"
        />
      </div>

      {["calories", "protein_g", "carbs_g", "fats_g"].map((field) => (
        <div key={field}>
          <label className="block mb-1 font-medium capitalize">{field.replace("_g", " (g)")}</label>
          <input
            type="number"
            name={field}
            value={form[field as keyof typeof form]}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>
      ))}

      <div>
        <label className="block mb-1 font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Logging..." : "Log Meal"}
      </button>
    </form>
  );
}
